import * as router from './declaring/router';
import pathToRegexp = require('path-to-regexp');

class easyRouter {
  router: router.eRs = {};

  // decorator
  requestMapping (url: string, method: string, options: object = {}) : Function {
    const that : easyRouter = this;
    return function (target: any, propertyKey: string) {
      that.setRouter(url, {
        httpMethod: method,
        constructor: target.constructor,
        handler: propertyKey,
      }, options);
    }
  }

  setRouter (url: string, easyrouter: router.eR, options: pathToRegexp.RegExpOptions & pathToRegexp.ParseOptions = {} ) : void {
    const _er = this.router[url];

    if (_er) {
      for (const key in _er.routerInstance) {
        const object = _er.routerInstance[key];

        if (object.httpMethod === easyrouter.httpMethod) {
          console.log(`路由地址 ${object.httpMethod} ${url} 已经存在`)
          return;
        }
      }
    } else {
      this.router[url] = {
        routerInstance: [],
        options,
      };
    }

    this.router[url].routerInstance.push(easyrouter);
  }

  getRoutes () : router.eRs {
    return this.router;
  }

}

// in loader.ts, get all routes
export = new easyRouter;