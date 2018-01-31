const path = require('path');
const url = require('url');
const electron = require('electron');
const events = require('./events');
const initRPC = require('./rpc');

const { app, BrowserWindow } = electron;
const ENTRY_PREFIX = process.env.ENTRY_PREFIX || url.format({
  pathname: path.join(__dirname, 'dist'),
  protocol: 'file:',
  slashes: true,
});
const server = {};

let loader;
let mainWindow;

app.on('ready', initLoader);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow == null) initLoader();
});

events.on('server.ready', () => {
  server.ready = true;
  initMain();
});

function initLoader() {
  if (server.ready) {
    initMain();
    return;
  }
  if (server.initialized) return;
  server.initialized = true;
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
  initRPC();
}

function initMain() {
  if (loader) loader.close();

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
}
