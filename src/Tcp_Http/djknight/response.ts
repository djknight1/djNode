import * as context from  './declaring/context';
import { cookieOptions } from  './declaring/cookie';
import { ServerResponse } from 'http';
import { sessionInterface } from './declaring/session';

const sessionKey: string = 'dsessionid';

export class ResContext implements context.resContext{
  res: ServerResponse;
  reqContext?: context.reqContext;

  constructor (res: ServerResponse) {
    this.res = res;
  }

  setCookie (name: string, val: string, opt?: cookieOptions) : void{
    const pairs: Array<string> = [`${name}=${val}`];
    if (opt) {
      if (opt.maxAge) pairs.push(`Max-Age=${opt.maxAge}`);
      if (opt.domain) pairs.push(`Domain=${opt.domain}`);
      if (opt.expires) pairs.push(`Max-Age=${opt.expires.toUTCString()}`);
      if (opt.httpOnly) pairs.push(`HttpOnly`);
      if (opt.secure) pairs.push(`Secure`);
      if (opt.path) pairs.push(`Path=${opt.path}`);
    }

    this.res.setHeader('Set-Cookie', pairs.join('; '));
  }

  setSession (key: string, value: any) : void {
    const session: sessionInterface = this.reqContext!.session;
    session[key] = value;
    this.setCookie(sessionKey, session.id);
  }

  end () {
    this.res.end(...arguments);
  }

}