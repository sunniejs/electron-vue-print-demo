<template>
  <div class="container">
    <webview id="printWebview" ref="printWebview" :src="fullPath" nodeintegration />
    <printDialog :dialog-visible="dialogVisible" @cancel="handlePrintDialogCancel" @select-print="printSelectAfter" />
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import path from 'path'
import printDialog from './PrintDialog.vue'
export default {
  name: 'Pinter',
  components: {
    printDialog
  },
  props: {
    // HtmlData: {
    //   type: String,
    //   default: '',
    // },
  },
  data() {
    return {
      printList: [],
      dialogVisible: false,
      printDeviceName: '',
      fullPath: path.join(__static, 'print.html'),
      messageBox: null,
      htmlData: ''
    }
  },

  mounted() {
    const webview = this.$refs.printWebview
    webview.addEventListener('ipc-message', (event) => {
      if (event.channel === 'webview-print-do') {
        console.log(this.printDeviceName)
        webview.print(
          {
            silent: true,
            printBackground: true,
            deviceName: this.printDeviceName
          },
          (data) => {
            this.messageBox.close()
            if (data) {
              this.$emit('complete')
            } else {
              this.$emit('cancel')
            }
          },
        )
      }
    })
  },
  methods: {
    print(val) {
      this.htmlData = val
      this.getPrintListHandle()
    },
    // 获取打印机列表
    getPrintListHandle() {
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList')
      ipcRenderer.once('getPrinterList', (event, data) => {
        // 过滤可用打印机
        this.printList = data.filter(element => element.status === 0)
        // 1.判断是否有打印服务
        if (this.printList.length <= 0) {
          this.$message({
            message: '打印服务异常,请尝试重启电脑',
            type: 'error'
          })
          this.$emit('cancel')
        } else {
          this.checkPrinter()
        }
      })
    },
    // 2.判断打印机状态
    checkPrinter() {
      // 本地获取打印机
      const printerName = this.$electronStore.get('printForm') || ''
      const printer = this.printList.find(device => device.name === printerName)
      // 有打印机设备并且状态正常直接打印
      if (printer && printer.status === 0) {
        this.printDeviceName = printerName
        this.printRender()
      } else if (printerName === '') {
        this.$message({
          message: '请先设置其他打印机',
          type: 'error',
          duration: 1000,
          onClose: () => {
            this.dialogVisible = true
          }
        })
        this.$emit('cancel')
      } else {
        this.$message({
          message: '当前打印机不可用,请重新设置',
          type: 'error',
          duration: 1000,
          onClose: () => {
            this.dialogVisible = true
          }
        })

      }
    },

    handlePrintDialogCancel() {
      this.$emit('cancel')
      this.dialogVisible = false
    },
    printSelectAfter(val) {
      this.dialogVisible = false
      this.$electronStore.set('printForm', val.name)
      this.printDeviceName = val.name
      this.printRender()
    },
    printRender(html) {
      this.messageBox = this.$message({
        message: '打印中，请稍后',
        duration: 0
      })
      // 获取<webview>节点
      const webview = this.$refs.printWebview
      // 发送信息到<webview>里的页面
      webview.send('webview-print-render', {
        printName: this.printDeviceName,
        html: this.htmlData
      })
    }
  }
}
</script>
<style scoped>
.container {
  position: fixed;
  right: -500px;
}
</style>
