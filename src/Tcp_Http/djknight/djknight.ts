import { IncomingMessage, ServerResponse } from 'http';
import easyRouter from './easyRouter';
import { Loader } from './loader';
import { ReqContext } from './request';
import { ResContext } from './response';
import pathToRegexp, { Key } from 'path-to-regexp'
import * as router from './declaring/router';
import * as context from  './declaring/context';

// TODO: 实现Etag等缓存策略
// TODO: 解决csrf 自定义请求头解决
// TODO: 完善自定义抛错方法
/**
 * TODO: 拆分出res与req的两个接口
 */
function init (req: IncomingMessage, res: ServerResponse) : { reqContext: ReqContext; resContext: ResContext; } {

  const reqContext = new ReqContext(req);
  const resContext = new ResContext(res);
  reqContext.resContext = resContext;
  resContext.reqContext = reqContext;
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  return {
    reqContext,
    resContext,
  };
}

export async function djknight (req: IncomingMessage, res: ServerResponse) : Promise<void> {
  const loader = new Loader();
  loader.loadController();
  try {
    const {reqContext, resContext} = init(req, res);
    dispatchRouter(reqContext, resContext, easyRouter.getRoutes());
  } catch (error) {
    console.log(error);
  }
}

async function dispatchRouter (reqContext: context.reqContext, resContext: context.resContext, routes: router.eRs) {
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
      resContext.res.end('404! 失败！');
      return;
    }
    const bestMatch: router.eR | undefined = matchingRoute.find((route: router.eR) => route.httpMethod.toUpperCase() === reqContext.method);

    if (bestMatch) {
      const instance = new bestMatch.constructor(reqContext, resContext);
      try {
        await instance[bestMatch.handler]();
      } catch (error) {

        resContext.res.writeHead(500);
        resContext.res.end(JSON.stringify({
          code: 500,
          stack: error.stack,
        }));
      }
    } else {
      resContext.res.writeHead(404, 'not Found!');
      resContext.res.end();
      return;
    }
  }
}


