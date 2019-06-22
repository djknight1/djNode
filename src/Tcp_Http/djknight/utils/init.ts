import { IncomingMessage, ServerResponse } from 'http';
import * as context from  '../declaring/context';
import querystring, { ParsedUrlQuery } from 'querystring';
import url  from 'url';
import rawBody from 'raw-body';

class ReqContext implements context.reqContext{
  req: IncomingMessage;

  query?: ParsedUrlQuery;
  pathName?: string;
  method?: string;
  length?: string;
  url?: string;
  _post_text?: Buffer;
  _post_json?: Object;
  _post_query?: Object;

  constructor (req: IncomingMessage) {
    this.req = req;
    this.url = req.url || '';
    if (req.url) {
      const pathName : string = url.parse(req.url!).pathname!;
      this.pathName = pathName;

      const query : ParsedUrlQuery = querystring.parse(url.parse(req.url).query || '');
      this.query = query;
    }

    this.method = req.method || '';

    if (req.headers['content-length']) {
      this.length = req.headers['content-length'];
    }
  }

  /**
   * 获取url的query参数
   * @return {json}
   */
  getQuery () {
    return Promise.resolve(this.query);
  }

  /**
   * 接收application/json
   * 内容严格要求为json格式，否则报错
   *
   * @param  {String} limit 长度限制
   * @return {json}
   */
  getPostJson (limit?: string) : Promise<void | Object | string> {
    if (!(mime(this.req) === 'application/json') && !this.length) {
      return Promise.resolve();
    }
    if(this._post_json) return Promise.resolve(this._post_json);

    return this.getPostText(limit || '').then((jsonBuff: string | Buffer) => {
      const jsonStr: string = jsonBuff.toString().trim();
      const first: string = jsonStr[0];

      if (first !== '{' && first !== '[') {
        throw(new Error('only json objects or arrays allowed'));
      }
      try {
        return (this._post_json = JSON.parse(jsonStr));
      } catch (error) {
        throw(error);
      }
    });
  }

  /**
   * 对raw-body的封装，用于接收text/xml text/html plain/text编码的参数
   *
   * @param  {String} limit 长度限制
   * @return {Text}
   */
  getPostText (limit?: string): Promise<Buffer | string>{
    const options: rawBody.Options = {
      limit: limit || '100kb',
      length: this.length,
      encoding: 'utf8'
    };

    // 作为缓存
    if(this._post_text) return Promise.resolve(this._post_text);
    return rawBody(this.req, options)
      .then(text => (this._post_text = text));
  }

  /**
   * 接收application/x-www-form-urlencoded编码的参数
   * 即 key=value&key1=value1
   *
   * @param  {String} limit 长度限制
   * @return {json}
   */
  getPostQuery (limit?: string) : Promise<void | Object | string> {
    if (!(mime(this.req) === 'application/x-www-form-urlencoded') && !this.length) {
      return Promise.resolve();
    }
    if (this._post_query) return Promise.resolve(this._post_query);

    return this.getPostText(limit).then((queryString: string | Buffer) => {
      try {
        const parsedQuery = querystring.parse(queryString.toString());
        return (this._post_query = parsedQuery);
      } catch (error) {
        throw new Error(error);
      }
    })
  }

}

export function init (req: IncomingMessage, res: ServerResponse) : context.reqContext {
  const reqContext = new ReqContext(req);
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  return reqContext;
}

function mime (req: IncomingMessage) : string {
  const contentType: string = req.headers['content-type'] || '';
  return contentType.split(';')[0];
}
