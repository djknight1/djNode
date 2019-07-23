import { v4 } from 'uuid';
import { sessionInterface } from '../declaring/session'

interface sessionPool {
  [sessionId: string]: sessionInterface;
}
const sessionPool: sessionPool = {};
const EXPIRE: number = 20 * 60 * 1000;

export function generateSession () : sessionInterface{
  const session: sessionInterface ={
    id : v4(),
    cookie : {
      expire: new Date().getTime() + EXPIRE,
    },
  };

  sessionPool[session.id] = session;

  return session;
}

export function returnSession (sessionId: string) : sessionInterface | undefined {
  return sessionPool[sessionId];
}

export function setExpire (session: sessionInterface, newExpire: number) : void {
  session.cookie.expire = new Date().getTime() + EXPIRE;
}

export function deleteSession (sessionId: string) : void {
  delete sessionPool[sessionId];
}