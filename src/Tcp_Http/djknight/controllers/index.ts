import { ServerResponse } from 'http';
import * as context from '../declaring/context';

export class Controller {
  reqContext: context.reqContext;
  resContext: context.resContext;

  constructor (reqContext: context.reqContext, res: context.resContext) {
    this.reqContext = reqContext;
    this.resContext = res;
  }
}