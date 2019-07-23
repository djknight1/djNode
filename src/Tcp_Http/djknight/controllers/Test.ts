import { Controller } from './index';
import es from '../easyRouter';

export class Test extends Controller {

  @es.requestMapping('/test', 'get')
  async test () {
    const text = await this.reqContext.getPostText();
    console.log('enter');
    console.log(text);
    console.log(this.reqContext.cookie);
    this.resContext.setCookie('test', '123');
    this.resContext.end('测试！！Get');
  }

  @es.requestMapping('/test', 'post')
  async testPost () {
    const json = await this.reqContext.getPostJson();
    console.log(json, '=======');
    this.resContext.end('测试！！Post');
  }

  @es.requestMapping('/test1', 'post')
  async test1 () {
    const json = await this.reqContext.getPostQuery();
    console.log(json, '=======');
    this.resContext.end('测试！！Post');
  }

  @es.requestMapping('/try/c/:x', 'get')
  async tryC () {
    this.resContext.end('测试！！Foo');
  }

  @es.requestMapping('/test-session', 'post')
  async testSession () {
    // TODO: 修改session为必须有
    const session = this.reqContext.getSession();
    console.log(session);
    if (!session.isVisit) {
      this.resContext.setSession('isVisit', true);
      this.resContext.setSession('rUOk', true);
      this.resContext.end('first');
    } else {
      this.resContext.end('again!');
    }
  }
}