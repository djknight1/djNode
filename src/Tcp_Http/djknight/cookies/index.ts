import { cookieInterface, cookieOptions } from '../declaring/cookie';

export function parseCookie (rawCookie: string | undefined) : cookieInterface {
  const cookie: cookieInterface = {};
  if (!rawCookie) {
    return cookie;
  }

  const list: Array<string> = rawCookie.split(';');
  list.forEach((item:string) => {
    const pair = item.split('=');
    cookie[pair[0].trim()] = pair[1];
  })

  return cookie;
}