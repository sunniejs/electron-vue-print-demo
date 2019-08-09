<template>
  <div class="container">
    <webview id="printWebview" ref="printWebview" :src="fullPath" nodeintegration />
  </div>
</template>

<script>
import printDialog from './PrintDialog.vue'
import { ipcRenderer, dialog } from 'electron'
import path from 'path'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      printDeviceName: 'BTP-U60(U) 1',
      fullPath: path.join(__static, 'print.html')
    }

  },
  mounted() {

    const webview = this.$refs.printWebview
    console.log(webview)
    // 在<webview>dom渲染完成后监听xmlData，解决<webview>未渲染完成就已经触发XmlData
    webview.addEventListener('dom-ready', () => {
      this.$watch('XmlData', (val) => {
        if (val === '') return;
        this.printRender()
      }, {
          immediate: true,
        });
    });

    webview.addEventListener('ipc-message', (event) => {
      if (event.channel === 'webview-print-do') {
        webview.print(
          {
            silent: true,
            printBackground: true,
            deviceName: this.printDeviceName,
          },
          (data) => {
            // this.messageBox.close();
            console.log('webview success', data);
            if (data) {
              this.$emit('complete');
            } else {
              this.$emit('cancel');
            }
          },
        )
      }
    })

  },
  methods: {
    getPrintListHandle(printerName, dialogShow) {
      // 发送获取打印机列表的请求到主线程，并且得到打印机列表
      // const printNameList = ipcRenderer.sendSync('get-print-list');
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList');
      ipcRenderer.once('getPrinterList', (event, data) => {
        console.log(data)
        // this.printList = data
        // 1.判断是否有打印服务
        // if (this.printList.length <= 0) {
        //   this.$message({
        //     message: '打印服务异常,请尝试重启电脑',
        //     type: 'error',
        //   });
        //   this.$emit('cancel');
        // } else if (dialogShow) {
        //   this.dialogVisible = dialogShow;
        // } else {
        //   this.checkPrinter(printerName);
        // }
      })
    },
    printRender(imgsrc) {
      // 获取<webview>节点
      // const webview = document.getElementById('printWebview');
      const webview = this.$refs.printWebview;
      // 发送信息到<webview>里的页面
      webview.send('webview-print-render', {
        printName: this.printDeviceName,
        imgSource: 'https://timgs.top1buyer.com/2019071910301465.jpg',
        imgWidth: 40,
        imgHeight: 40
      })
    }
  }
}
</script>
<style scoped>
</style>
