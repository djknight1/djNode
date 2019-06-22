import { IncomingMessage, ServerResponse } from 'http';
import easyRouter from './easyRouter';
import { Loader } from './loader';
import { init } from './utils/init';
import pathToRegexp, { Key } from 'path-to-regexp'
import * as router from './declaring/router';
import * as context from  './declaring/context';

export function djknight (req: IncomingMessage, res: ServerResponse) : void {
  const loader = new Loader();
  loader.loadController();
  try {
    const reqContext = init(req, res);
    dispatchRouter(reqContext, res, easyRouter.getRoutes());
  } catch (error) {
    console.log(error);
  }
}

async function dispatchRouter (reqContext: context.reqContext, res: ServerResponse, routes: router.eRs) {
  if (reqContext.url) {
    const keys : Key[] = [];
    let matchingRoute: Array<router.eR> = [];

    Object.keys(routes).forEach(routePath => {
      const routeInfo : router.routerInfo = routes[routePath];
      const pathReg : RegExp = pathToRegexp(routePath, keys, routeInfo.options);

      if (pathReg.exec(reqContext.pathName!)) {
        matchingRoute = routeInfo.routerInstance;
      }
      console.log(pathReg, reqContext.pathName);
    });


    if (!matchingRoute[0]) {
      // no matched routes
      res.end('404! 失败！');
      return;
    }
    const bestMatch: router.eR | undefined = matchingRoute.find((route: router.eR) => route.httpMethod.toUpperCase() === reqContext.method);

    if (bestMatch) {
      const instance = new bestMatch.constructor(reqContext, res);

      await instance[bestMatch.handler]();
    } else {
      res.write(404, 'not Found!');
      res.end();
      return;
    }
  }
}


