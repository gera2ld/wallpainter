const path = require('path');
const url = require('url');
const electron = require('electron');
const { spawn } = require('child_process');
const events = require('./events');

const { app, BrowserWindow } = electron;
const ENTRY_PREFIX = process.env.ENTRY_PREFIX || url.format({
  pathname: path.resolve(__dirname, '../dist'),
  protocol: 'file:',
  slashes: true,
});

const server = spawn('python', ['-m', 'wallpainter'], {
  cwd: path.resolve('..'),
});
const SERVER_CMD_PREFIX = '[server] CMD: ';
server.stdout.on('data', (chunk) => {
  let data = String(chunk).trimRight();
  console.info(data);
  if (data.startsWith(SERVER_CMD_PREFIX)) {
    data = data.slice(SERVER_CMD_PREFIX.length);
    const i = data.indexOf(' ');
    const cmd = i >= 0 ? data.slice(0, i) : data;
    const args = i >= 0 ? data.slice(i + 1) : null;
    const eventType = `server.${cmd}`;
    events.emit(eventType, args);
    console.info('[app]', eventType, args);
  }
});
server.stderr.on('data', (chunk) => {
  const data = String(chunk).trim();
  console.error(data);
});
server.on('close', () => {
  console.error('[server]', 'crashed');
  app.quit();
});
process.on('exit', () => {
  server.kill('SIGINT');
});

let loader;
let mainWindow;

app.on('ready', initLoader);

app.on('window-all-closed', () => {
  app.quit();
});

events.once('server.ready', () => {
  initMain();
});

function initLoader() {
  if (mainWindow) return;
  loader = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    center: true,
  });
  loader.loadURL(`${ENTRY_PREFIX}/loader.html`);
  loader.on('closed', () => {
    loader = null;
  });
}

function initMain() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 800,
    toolbar: false,
    webPreferences: {
      webSecurity: false,
    },
  });

  // for Windows and Linux
  mainWindow.setMenu(null);

  mainWindow.loadURL(`${ENTRY_PREFIX}/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (loader) loader.close();
}
