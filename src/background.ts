'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

const { autoUpdater } = require('electron-updater');


const Store = require('electron-store');
const store = new Store();

// Electron Store songs, tags, etc.

ipcMain.on('setData', (type, data) => store.set( type, data ));
ipcMain.on('getData', (type ) => {
  const data = store.get(type);
  mainWin.webContents.send('newData', data);
  mainWin.webContents.send('newData', data);
});


// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

var mainWin = {} as BrowserWindow;
var configWin = {} as BrowserWindow;

async function createWindow() {
  // Create the browser window.
  mainWin = new BrowserWindow({
    width: 1700,
    height: 900,
    minWidth: 500,
    minHeight: 300,
    webPreferences: {
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      webSecurity: true,
      enableRemoteModule: true,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
    if (!process.env.IS_TEST) mainWin.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWin.loadURL('app://./index.html')
    mainWin.setMenuBarVisibility(false)
  }

  mainWin.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  mainWin.on('closed', () => app.quit());
}


// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('configurationIpc', (event, arg) => {
  configWin = new BrowserWindow({
    width: 1500,
    height: 800,
    minWidth: 500,
    minHeight: 300,
    parent: mainWin,
    webPreferences: {
      contextIsolation: false,
      nodeIntegrationInWorker: true,
      webSecurity: true,
      enableRemoteModule: true,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean
    }
  })

  if(process.env.NODE_ENV != 'development') mainWin.setMenuBarVisibility(false);

  const modalPath = process.env.NODE_ENV === 'development'
    ? `http://localhost:8080/#/configuration`
    : `file://${__dirname}/index.html#configuration`

  configWin.loadURL(modalPath);

  configWin.once('ready-to-show', () => {
    if(arg == 'tags') configWin.webContents.send('tags');
  })

})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {

  //PROTOCOLO SAFE
  const protocolName = 'safe-file-protocol';

  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '')
    try {
      return callback(decodeURIComponent(url))
    }
    catch (error) {
      // Handle the error as needed
      console.error(error)
    }
  })
  ////

  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()

  ipcMain.on('reloadData', () => {
    mainWin.webContents.send('reloadData');
  })
  
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}


