const path = require('path');
const { spawn } = require('child_process');

const child = spawn('python', [
  '-m',
  'wallpainter.rpc',
]);
child.stdout.on('data', data => {
  process.stdout.write(String(data));
});
child.stderr.on('data', data => {
  process.stdout.write(String(data));
});
child.on('close', code => {
  console.log('exit', code);
});
