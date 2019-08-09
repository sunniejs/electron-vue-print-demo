/**
 * 最小化到托盘  windows系统可用
 */
const { app, Menu, Tray } = require('electron')
const { trayIcon } = require('./config')

export const setTray = (win, options = []) => {
  let tray = new Tray(trayIcon)
  const trayMemu = [
    {
      label: '打开' + app.getName(),
      click() {
        win.show()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click() {
        app.quit()
      }
    }
  ]
  const contextMenu = Menu.buildFromTemplate(trayMemu)
  tray.setContextMenu(contextMenu)
  tray.setToolTip(app.getName())
  return tray
}
