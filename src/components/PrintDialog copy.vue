<template>
  <div>
    <el-dialog :visible="dialogVisible" :append-to-body="true" :show-close="false" title="打印机设置">
      <el-table :data="printList" highlight-current-row border @current-change="handleCurrentChange">
        <el-table-column property="name" label="打印机名称" show-overflow-tooltip />
      </el-table>
      <div class="buttonStyle">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="selectPrint">确认</el-button>
      </div>
    </el-dialog>
  </div>

</template>
<script>

import { ipcRenderer } from 'electron'
export default {
  name: '',
  props: {
    printData: {
      type: Array,
      default: () => []
    },
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      rowData: null,
      printList: []
    }
  },

  computed: {
    filterPrint() {
      return this.printData.filter(element => element.status === 0)
    }
  },
  mounted() {
    this.checkPrintConfig()
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
    // formatter(row) {
    //   return row.status === 0 ? '是' : '否';
    // },
    handleCurrentChange(row) {
      this.rowData = row
    },
    selectPrint() {
      if (this.rowData) {
        this.$emit('select-print', this.rowData)
      } else {
        this.$message({
          message: '您还没有选择打印机',
          type: 'warning'
        })
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.buttonStyle {
  text-align: right;
  margin-top: 20px;
}
</style>
