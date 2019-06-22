import http from 'http';
import { djknight } from './djknight/djknight'

export default function () : void{
  http.createServer(djknight).listen(3000);
}