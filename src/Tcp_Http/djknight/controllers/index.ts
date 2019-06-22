import { ServerResponse } from 'http';
import * as context from '../declaring/context';

export class Controller {
  reqContext: context.reqContext;
  response: ServerResponse;

  constructor (reqContext: context.reqContext, res: ServerResponse) {
    this.reqContext = reqContext;
    this.response = res;
  }
}