import * as cp from 'child_process';
import * as net from 'net';
import * as path from 'path'
import * as os from 'os';
import { configure, getLogger } from 'log4js';

configure({
	appenders: { cluster: { type: 'file', filename: 'master_process.log' } },
	categories: { default: { appenders: ['cluster'], level: 'error' } }
});

const logger = getLogger();


interface workerProcress {
  [propName: string]: cp.ChildProcess | null;
}
const server : net.Server = net.createServer();
server.listen(3000);

const restartLimit : number = 10;
let restart : Array<number> = [];
const duration = 600000;  // 6s
function isTooFrequently() : boolean {
  const time : number = Date.now();
  const length : number = restart.push(time);

  // 采用先进先出方式, 取出后10个元素
  if (length > restartLimit) {
   restart = restart.slice(restartLimit * -1);
  }
  // 60s内重启次数超过10次，且最后一次和第一次重启的间隔小于duration
  return restart.length >= restartLimit && restart[restart.length - 1] - restart[0] < duration;
}


let workers : workerProcress = {};
const createWorker = function () : void {
  const worker : cp.ChildProcess = cp.fork(path.join(__dirname, 'child.ts'));
  worker.send('server', server);
  workers[worker.pid] = worker;

  console.log(`worker ${worker.pid} created`);

  // 如果太过频繁,则触发giveup
  if (isTooFrequently()) {
    // trick方法, 暂时不知道为什么无法触发自定义事件
    process.emit('message', {
      act: 'giveup',
      count: restart.length,
      time: duration,
    }, null);

    return;
  }

  worker.on('message', (msg : string) => {
    if (msg === 'suicide') {
      workers[worker.pid] = null;
      delete workers[worker.pid];
      createWorker();
    }
  })

  worker.on('exit', () => {
    console.log(`work ${worker.pid} exit`);
    workers[worker.pid] = null;
    delete workers[worker.pid];

    createWorker();
  })

};

export default function () : void {
  const cpus = os.cpus();

  for (let i : number = 0; i < cpus.length; i++) {
    createWorker();
  }

  process.on('exit', function () {
    for (let pid  in workers) {
      workers[pid]!.kill();
    }
  });

  process.on('message', msg => {
    if (msg.act === 'giveup') {
      logger.log('giveup!!!');
      logger.error(`子进程频繁退出${msg.count}次, 间隔${msg.time}秒`);

      server.close(function () {
        process.exit(1)
      })

      setTimeout(() => {
        process.exit(1)
      }, 5000)
    }
  })
}