const path = require('path');
const { spawn } = require('child_process');
const events = require('./events');

let child;
module.exports = initRPC;

function initRPC() {
  child = spawn(process.env.PYTHON || 'python', [
    '-m',
    'wallpainter.rpc',
  ], {
    cwd: path.resolve('..'),
  });
  child.stdout.on('data', chunk => {
    const data = String(chunk).trim();
    const i = data.indexOf(' ');
    const [cmd, arg] = i < 0 ? [data] : [data.slice(0, i), data.slice(i + 1)];
    events.emit(`server.${cmd}`, arg);
    // process.stdout.write(data);
  });
  child.stderr.on('data', chunk => {
    const data = String(chunk);
    process.stderr.write(data);
  });
  child.on('close', code => {
    console.info('exit', code);
  });

  process.on('SIGINT', () => { process.exit(); });
  process.on('SIGTERM', () => { process.exit(); });
  process.on('exit', () => {
    child.kill('SIGINT');
  });
}
