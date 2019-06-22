import * as net from 'net'

export default function test () {
  console.log('start?');
  for (let index = 0; index < 100; index++) {
    const ser = net.createConnection(3000);
    ser.end();
  }
}
