export default function getPrinterList(event) {
  const { sender } = event
  const list = sender.webContents.getPrinters()
  sender.webContents.send('getPrinterList', list)
}
