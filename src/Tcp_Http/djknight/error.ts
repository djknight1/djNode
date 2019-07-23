import { customError } from './declaring/customError';

export class CustomError implements customError {
  code: number;
  description: string;
  stack:string;

  constructor (code:number, err: Error | string) {
    this.code = code;
    if (err instanceof Error) {
      this.description = err.message;
      this.stack = err.stack || '';
    } else {
      const errByString = new Error(err);
      this.description = errByString.message;
      this.stack = errByString.stack || '';
    }
  }
}