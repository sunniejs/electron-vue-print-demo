/**
 * 崩溃日志，崩溃重启
 */

import { BrowserWindow, crashReporter, dialog } from 'electron'
// 开启进程崩溃记录
crashReporter.start({
  productName: 'electron-app',
  companyName: 'SunSoft',
  submitURL: 'http://127.0.0.1:3000/crashreporter', // 上传崩溃日志的接口
  uploadToServer: true
})
function reloadWindow(mainWin) {
  if (mainWin.isDestroyed()) {
    app.relaunch()
    app.exit(0)
  } else {
    // 销毁其他窗口
    BrowserWindow.getAllWindows().forEach(w => {
      if (w.id !== mainWin.id) w.destroy()
    })
    const options = {
      type: 'info',
      title: '渲染器进程崩溃',
      message: '这个进程已经崩溃.',
      buttons: ['重载', '关闭']
    }
    dialog.showMessageBox(options, index => {
      if (index === 0) mainWin.reload()
      else mainWin.close()
    })
  }
}
export const onCrash = win => {
  win.webContents.on('crashed', () => {
    const errorMessage = crashReporter.getLastCrashReport()
    console.error('程序崩溃了！', errorMessage)
    reloadWindow(win)
  })
}
