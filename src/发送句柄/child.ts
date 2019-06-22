import { Socket, Server } from 'net';
import * as http from 'http';
import { configure, getLogger } from 'log4js';

configure({
	appenders: { cluster: { type: 'file', filename: 'child_process.log' } },
	categories: { default: { appenders: ['cluster'], level: 'error' } }
});

const logger = getLogger();

const httpServer : http.Server = http.createServer((req, resp) => {
   resp.writeHead(200, {'Content-Type': 'text/plain'});
   resp.end('handled by child, pid is ' + process.pid + '\n');
   throw new Error('uncaughtException');
});

let worker : Server;
process.on('message', (m, tcp) => {
   console.log('recieved!');
   if (m === 'server') {
      worker = tcp;
      worker.on('connection', (socket: Socket) => {
         httpServer.emit('connection', socket);
    });
  }
});


// 一旦有未捕获的异常出现，工作进程立即停止接受新连接，当所有连接断开后，退出进程
// 但是当极端情况,所有工作进程全部死亡的时候,会丢掉很多连接, 所以,当捕获到异常的时候,向父进程发送信号
// 父进程一收到信号,就将自动重启
// 如果出现未捕获的异常, 说明代码的健壮性是一个问题, 所以我们需要日志记录
process.on('uncaughtException', function (e) {
   logger.error(e);
   if (process.send) {
      process.send('suicide');
   }

   worker.close(() => {
      process.exit(1);
   });

   // 当连接是长连接时, 想要等待连接断开不回那么快, 这时候就需要我们设置一个超时时间
   setTimeout(() => {
      process.exit(1);
   }, 5000);
});