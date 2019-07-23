import * as context from  './declaring/context';
import { cookieInterface } from  './declaring/cookie';
import { sessionInterface } from  './declaring/session';

import querystring, { ParsedUrlQuery } from 'querystring';

import { parseCookie } from  './cookies';
import { generateSession, returnSession, setExpire, deleteSession } from './session'

import url  from 'url';
import rawBody from 'raw-body';
import { IncomingMessage } from 'http';
import { CustomError } from './error';

const sessonKey: string = 'dsessionid';

export class ReqContext implements context.reqContext{
  req: IncomingMessage;
  resContext?: context.resContext;

  query?: ParsedUrlQuery;
  pathName?: string;
  method?: string;
  length?: string;
  url?: string;
  _post_text?: Buffer;
  _post_json?: Object;
  _post_query?: Object;
  _post_body?: Object;
  cookie: cookieInterface;
  session: sessionInterface;

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
    this.cookie = parseCookie(req.headers.cookie);
    this.session = this.getSession();

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
   * 接收multipart/form-data
   * TODO
   */
  /* getPostData (dest: string) {
    if (!this.length || !this.mime('multipart/form-data')){
      return Promise.resolve();
    }
    if(this._post_body) return Promise.resolve(this._post_body);

    const busBoy = new BusBoy()
    interface fileInfo {
      fileName: string;
      originalname: string;
      encoding: string;
      mimetype: string;
    }
    interface formData {
      files: fileInfo
      [fieldName: string]: any,
    }
  } */

  /**
   * 接收application/json
   * 内容严格要求为json格式，否则报错
   *
   * @param  {String} limit 长度限制
   */
  getPostJson (limit?: string) : Promise<void | Object | string> {
    if (!(this.mime('application/json')) && !this.length) {
      return Promise.resolve();
    }

    if(this._post_json) return Promise.resolve(this._post_json);

    return this.getPostText(limit || '').then((jsonBuff: string | Buffer) => {
      const jsonStr: string = jsonBuff.toString().trim();
      const first: string = jsonStr[0];

      if (first !== '{' && first !== '[') {
        throw(new CustomError(400, 'only json objects or arrays allowed'));
      }
      try {
        return (this._post_json = JSON.parse(jsonStr));
      } catch (error) {
        throw(new CustomError(500, error));
      }
    });
  }

  /**
   * 对raw-body的封装，用于接收text/xml text/html plain/text编码的参数
   *
   * @param  {String} limit 长度限制
   */
  getPostText (limit?: string): Promise<Buffer | string >{
    // 作为缓存
    if(this._post_text) return Promise.resolve(this._post_text);

    const options: rawBody.Options = {
      limit: limit || '100kb',
      length: this.length,
      encoding: 'utf8'
    };
    return rawBody(this.req, options)
      .then(text => (this._post_text = text));
  }

  /**
   * 接收application/x-www-form-urlencoded编码的参数
   * 即 key=value&key1=value1
   *
   * @param  {String} limit 长度限制
   */
  getPostQuery (limit?: string) : Promise<void | Object | string> {
    if (!this.mime('application/x-www-form-urlencoded') && !this.length) {
      return Promise.resolve();
    }
    if (this._post_query) return Promise.resolve(this._post_query);

    return this.getPostText(limit).then((queryString: string | Buffer) => {
      try {
        const parsedQuery = querystring.parse(queryString.toString());
        return (this._post_query = parsedQuery);
      } catch (error) {
        throw new CustomError(400, error);
      }
    })
  }

  mime (header: string) : boolean {
    return !!this.req.headers['content-type'] && this.req.headers['content-type'].split(';')[0].trim() === header;
  }

  /**
   * TODO: 增加redis，更改获取session为异步
   * TODO: 增加加密算法
   * p188
   */
  getSession () : sessionInterface {
    const sessionId: string = this.cookie[sessonKey];
    let session: sessionInterface | undefined;
    if (!sessionId) {
      session = generateSession();
    } else {
      session = returnSession(sessionId);

      if (session) {
        if (session.cookie.expire > new Date().getTime()) {
          // 未过期 重新设置过期时间
          setExpire(session, new Date().getTime());
        } else {
          // 过期了
          deleteSession(sessionId);
          session = generateSession();
        }
      } else {
        session = generateSession();
      }

    }
    return session;
  }

}
