const path = require('path')
const join = name => path.join(__dirname, name)
module.exports = {
  trayIcon: join('../public/favicon.ico'),
  rendererPath: join('../renderer_process'),
  rendererDevPath: join('../dist'),
  devtools: {
    open: false,
    mode: 'bottom' // //detach right bottom
  }
}
