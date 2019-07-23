export interface sessionInterface {
  id: string;
  cookie: {
    expire: number,
  };
  __csrf?: string;
  [key: string]: any;
}