<template>
  <div class="container">
    <webview id="printWebview" ref="printWebview" :src="fullPath" nodeintegration />
    <!-- <printDialog :print-data="printList" :dialog-visible="dialogVisible" @cancel="handlePrintDialogCancel" @select-print="printSelectAfter" /> -->
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import path from 'path'
// import printDialog from './PrintDialog.vue'

export default {
  name: 'Pinter',
  components: {
    // printDialog
  },
  data() {
    return {
      printList: [],
      dialogVisible: true,
      printDeviceName: '',
      fullPath: path.join(__static, 'print.html'),
      messageBox: null
    }
  },
  mounted() {
    const webview = this.$refs.printWebview
    // 在<webview>dom渲染完成后监听xmlData，解决<webview>未渲染完成就已经触发XmlData
    webview.addEventListener('dom-ready', () => {
      // 获取打印设置
      this.checkPrintConfig()
    })
    webview.addEventListener('ipc-message', (event) => {
      if (event.channel === 'webview-print-do') {
        // webview.print(
        //   {
        //     silent: true,
        //     printBackground: true,
        //     deviceName: this.printDeviceName
        //   },
        //   (data) => {
        //     this.messageBox.close()
        //     if (data) {
        //       this.$emit('complete')
        //     } else {
        //       this.$emit('cancel')
        //     }
        //   },
        // )
      }
    })
  },
  methods: {
    // 打印设置
    checkPrintConfig() {
      // 获取本地设置打印机名称
      const name = this.$electronStore.get('printForm') || ''
      if (name) {
        this.printDeviceName = name
        // 如果已经设置不弹窗
        this.getPrintListHandle(name, false)
      } else {
        this.getPrintListHandle(name, true)
      }
    },
    // 获取打印机列表
    getPrintListHandle(printerName, dialogShow) {
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList')
      ipcRenderer.once('getPrinterList', (event, data) => {
        this.printList = data
        // 1.判断是否有打印服务
        if (this.printList.length <= 0) {
          this.$message({
            message: '打印服务异常,请尝试重启电脑',
            type: 'error'
          })
          this.$emit('cancel')
        } else if (dialogShow) {
          this.dialogVisible = dialogShow
        } else {
          this.checkPrinter(printerName)
        }
      })
    },
    // 2.判断打印机状态
    checkPrinter(printerName) {
      const hasDevice = this.printList.find(device => device.name === printerName)
      // 有打印机设备并且状态正常直接打印
      if (hasDevice && hasDevice.status === 0) {
        this.printRender()
      } else {
        this.$message({
          message: '打印服务异常,无法找到打印机',
          type: 'error'
        })
        this.$emit('cancel')
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
      const htmlData = '<div>打印测试1</div>'
      // this.messageBox = this.$message({
      //   message: '打印中，请稍后',
      //   duration: 0
      // })
      // 获取<webview>节点
      // const webview = document.getElementById('printWebview');
      const webview = this.$refs.printWebview
      // 发送信息到<webview>里的页面
      webview.send('webview-print-render', {
        printName: this.printDeviceName,
        html: htmlData
      })
    }
  }
}
</script>
<style scoped>
</style>
