import { Controller } from './index';
import es from '../easyRouter';

export class Test extends Controller {

  @es.requestMapping('/test', 'get')
  async test () {
    const text = await this.reqContext.getPostText();
    console.log(text);
    this.response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    this.response.end('测试！！Get');
  }

  @es.requestMapping('/test', 'post')
  async testPost () {
    const json = await this.reqContext.getPostText();
    console.log(json, '=======');
    this.response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    this.response.end('测试！！Post');
  }

  @es.requestMapping('/test1', 'post')
  async test1 () {
    const json = await this.reqContext.getPostQuery();
    console.log(json, '=======');
    this.response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    this.response.end('测试！！Post');
  }

  @es.requestMapping('/try/c/:x', 'get')
  async tryC () {
    this.response.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    this.response.end('测试！！Foo');
  }
}