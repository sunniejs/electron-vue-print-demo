import * as path from 'path'
import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import ElectronStore from 'electron-store'
// ElectronStore 默认数据
import electronDefaultData from './config/electron-default-data'
// 设置菜单
import { setMenu } from './main-process/menu'
// 设置托盘
import { setTray } from './main-process/tray'
// 获取所有  ipcMain事件
import ipcMainEvent from './main-process/event'
const isDevelopment = process.env.NODE_ENV !== 'production'
let tray = null
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// 窗口映射对象
global.$winodws = {
  main: null
}

const winodws = global.$winodws

let win

let electronStore
// Scheme must be registered before the app is ready
protocol.registerStandardSchemes(['app'], { secure: true })

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
  // 设置托盘
  tray = setTray(win)
  // 设置菜单
  setMenu()
  win.on('closed', () => {
    win = null
  })
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installVueDevtools()
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  // 初始化配置文件
  electronStore = new ElectronStore({
    defaults: electronDefaultData,
    cwd: app.getPath('userData')
  })
  global.electronStore = electronStore
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
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

// 初始化事件监听  ipcMain.on event
Object.keys(ipcMainEvent).forEach(key => {
  ipcMain.on(key, (event, ...args) => {
    ipcMainEvent[key](event, winodws, ...args)
  })
})
