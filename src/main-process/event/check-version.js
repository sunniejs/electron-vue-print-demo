/* eslint import/no-extraneous-dependencies: 0 */
import log from 'electron-log'
import path from 'path'
// import ElectronStore from 'electron-store';
import { ipcMain, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { format as formatUrl } from 'url'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { AUTO_UPDATE_URL } from '../../config'

let updateWindow
// let loginWindow
console.log('update')
const isDevelopment = process.env.NODE_ENV !== 'production'

function createUpdateWindow() {
  const window = new BrowserWindow({
    title: process.env.VUE_APP_PRODUCT_NAME,
    width: 320,
    height: 160,
    frame: false,
    resizable: false,
    useContentSize: true,
    show: false,
    // parent: mainWindow,
    backgroundColor: '#FFF',
    webPreferences: { webSecurity: false }
  })

  if (isDevelopment) {
    // Load the url of the dev server if in development mode
    window.loadURL(`${process.env.WEBPACK_DEV_SERVER_URL}/update.html`)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    //   Load the index.html when not in development
    window.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'update.html'),
        protocol: 'file',
        slashes: true
      })
    )
  }

  window.on('closed', () => {
    global.$winodws.check = null
  })

  return window
}

// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message, data) {
  updateWindow.webContents.send('update-message', { message, data })
}

const checkForUpdates = () => {
  const { electronStore } = global

  autoUpdater.autoDownload = false
  const host = electronStore.get('host')
  const autoUpdateService = host + AUTO_UPDATE_URL
  console.log(autoUpdateService)
  // 配置安装包远端服务器
  autoUpdater.setFeedURL(autoUpdateService)
  // 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', message => {
    sendUpdateMessage('error', message)
  })

  autoUpdater.on('update-available', message => {
    updateWindow = createUpdateWindow()
    // loginWindow.close()
    // 优化首次窗口加载效果
    updateWindow.on('ready-to-show', () => {
      updateWindow.show()
      sendUpdateMessage('update-available', message)
      setTimeout(() => {
        autoUpdater.downloadUpdate()
      }, 1000)
    })
  })

  // 更新下载进度事件
  autoUpdater.on('download-progress', progressObj => {
    sendUpdateMessage('download-progress', progressObj)
  })
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', () => {
    sendUpdateMessage('update-downloaded')
    ipcMain.on('updateNow', () => {
      autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.checkForUpdates()
}

export default function autoUpdate(event, { login }) {
  // loginWindow = login
  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'
  checkForUpdates()
}
