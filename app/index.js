const path = require('path');
const url = require('url');
const electron = require('electron');
require('./rpc');

const { app, BrowserWindow } = electron;

let mainWindow;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow == null) createWindow();
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
    },
  });
  const entryUrl = process.env.ENTRY_URL || url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow.loadURL(entryUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}
