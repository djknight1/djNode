export interface cookieInterface {
  [propName: string]: string;
}

export interface cookieOptions {
  maxAge?: string;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly: boolean;
}