import { IncomingMessage } from 'http';
import { ParsedUrlQuery } from 'querystring';

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
  getPostText: (limit?: string) => Promise<Buffer | string>;
  getPostJson: (limit?: string) => Promise<void | Object | string>;
  getPostQuery: (limit?: string) => Promise<void | Object | string>;
  [propName: string]: any;
}
