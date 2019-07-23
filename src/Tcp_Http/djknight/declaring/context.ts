import { IncomingMessage, ServerResponse } from 'http';
import { ParsedUrlQuery } from 'querystring';
import { cookieInterface, cookieOptions } from './cookie';
import { sessionInterface } from './session';

export interface reqContext {
  req: IncomingMessage;
  method?: string;
  query?: ParsedUrlQuery;
  pathName?: string;
  url?: string;
  length?: string;
  _post_text?: Buffer;
  _post_json?: Object;
  _post_query?: Object;
  _post_body?: Object;
  getPostText: (limit?: string) => Promise<Buffer | string>;
  getPostJson: (limit?: string) => Promise<void | Object | string>;
  getPostQuery: (limit?: string) => Promise<void | Object | string>;
  cookie: cookieInterface,
  getSession: () => sessionInterface;
  session: sessionInterface;
  [propName: string]: any;
}

export interface resContext {
  res: ServerResponse;

  setCookie: (name: string, val: string, opt?: cookieOptions) => void;
  setSession: (key: string, value: any) => void;

  // mock res.end
  // TODO: find better solution
  end(cb?: () => void): void;
  end(chunk: any, cb?: () => void): void;
  end(chunk: any, encoding: string, cb?: () => void): void;

  [propName: string]: any;
}