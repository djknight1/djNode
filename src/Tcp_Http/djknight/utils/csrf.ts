import crypto from 'crypto';
import { reqContext, resContext } from '../declaring/context';

const csrfHeader = 'x-csrf';

interface CsrfOptions {
  invalidTokenErrMessage: string,
  invalidTokenErrCode: number,
  excludedMethods: string[],
}

class CSRF {
  opts: CsrfOptions;

  constructor (opt: CsrfOptions) {
    this.opts = Object.assign({
      invalidTokenMessage: 'Invalid CSRF token',
      invalidTokenStatusCode: 403,
      excludedMethods: ['GET', 'HEAD', 'OPTIONS'],
    }, opt);

  }

  setToken (req: reqContext, res: resContext) {
    const token: string = req.session.__csrf || (req.session.__csrf = generateToken(24));
    const __csrf = req.req.headers[csrfHeader];
    if (!__csrf || token !== __csrf) {
      res.res.writeHead(this.opts.invalidTokenErrCode);
      res.res.end(this.opts.invalidTokenErrMessage);
    }
  }
}

function generateToken (length: number): string {
  return crypto.randomBytes(Math.ceil(length * 3 / 4))
  .toString('base64')
  .slice(0, length);
}