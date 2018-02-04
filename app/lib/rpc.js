const path = require('path');
const { spawn } = require('child_process');
const events = require('./events');

exports.initRPC = initRPC;
exports.crawl = crawl;

function initRPC() {
  const child = safeSpawn([
    '-m',
    'wallpainter.rpc',
  ]);
  child.stdout.on('data', chunk => {
    const data = String(chunk).trim();
    const i = data.indexOf(' ');
    const [cmd, arg] = i < 0 ? [data] : [data.slice(0, i), data.slice(i + 1)];
    events.emit(`server.${cmd}`, arg);
    // process.stdout.write(data);
  });
}

function crawl() {
  const child = safeSpawn([
    '-m',
    'wallpainter',
  ]);
  child.stdout.on('data', chunk => {
    const data = String(chunk);
    process.stdout.write(data);
  });
  child.on('close', code => {
    events.emit('crawl.end', code);
  });
}

function safeSpawn(args) {
  const child = spawn(process.env.PYTHON || 'python', args, {
    cwd: path.resolve('..'),
  });
  child.stderr.on('data', chunk => {
    const data = String(chunk);
    process.stderr.write(data);
  });
  child.on('close', code => {
    console.info(`exit/${args.join(' ')}/${code}`);
  });
  process.on('exit', () => {
    child.kill('SIGINT');
  });
  return child;
}

process.on('SIGINT', () => { process.exit(); });
process.on('SIGTERM', () => { process.exit(); });
