import pathToRegexp = require("path-to-regexp");

export interface eR {
    httpMethod: string,
    constructor: any,     // controller
    handler: string,      // method name, equals property
}

export interface eRs {
    [propName: string]: routerInfo;
}

export interface routerInfo {
    routerInstance: Array<eR>,
    options: pathToRegexp.RegExpOptions & pathToRegexp.ParseOptions,
}

