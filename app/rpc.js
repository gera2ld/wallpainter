const path = require('path');
const { spawn } = require('child_process');

const child = spawn(process.env.PYTHON || 'python', [
  '-m',
  'wallpainter.rpc',
], {
  cwd: path.resolve('..'),
});
child.stdout.on('data', data => {
  process.stdout.write(String(data));
});
child.stderr.on('data', data => {
  process.stdout.write(String(data));
});
child.on('close', code => {
  console.log('exit', code);
});

process.on('SIGINT', () => { process.exit(); });
process.on('SIGTERM', () => { process.exit(); });
process.on('exit', () => {
  child.kill('SIGINT');
});
