<template>
  <div id="app">
    <el-button @click="autoUpdate">更新</el-button>
    <el-button type="primary" @click="showPrint">设置打印机</el-button>
    <printDialog :dialog-visible="dialogVisible" @cancel="handlePrintDialogCancel" />
    <pinter ref="print" :html-data="HtmlData"></pinter>
    <el-table ref="filterTable" :data="tableData" style="width: 100%">
      <el-table-column prop="date" label="日期" width="180" column-key="date">
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="180">
      </el-table-column>
      <el-table-column prop="address" label="地址">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" @click="doPrint(scope.row)">打印</el-button>
        </template>

      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import { ipcRenderer } from 'electron'
import printDialog from './components/PrintDialog.vue'
import Pinter from './components/pinter.vue'
export default {
  name: 'App',
  components: {
    Pinter,
    printDialog
  },
  data() {
    return {
      dialogVisible: false,
      HtmlData: '',
      printList: [],
      tableData: [{
        date: '2016-05-02',
        name: '王小虎1',
        address: '上海市普陀区金沙江路 1518 弄',
        tag: '家'
      }, {
        date: '2016-05-04',
        name: '王小虎2',
        address: '上海市普陀区金沙江路 1517 弄',
        tag: '公司'
      }, {
        date: '2016-05-01',
        name: '王小虎3',
        address: '上海市普陀区金沙江路 1519 弄',
        tag: '家'
      }, {
        date: '2016-05-03',
        name: '王小虎4',
        address: '上海市普陀区金沙江路 1516 弄',
        tag: '公司'
      }]
    }
  },
  mounted() {
    ipcRenderer.send('checkVersion')
    this.getPrintListHandle()
  },
  methods: {
    autoUpdate() {
      ipcRenderer.send('autoUpdate');
    },
    getPrintListHandle() {
      console.log('mounted')
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList')
      ipcRenderer.once('getPrinterList', (event, data) => {
        // 过滤可用打印机
        this.printList = data.filter(element => element.status === 0)
      })
    },
    showPrint() {
      this.dialogVisible = true
    },
    handlePrintDialogCancel() {
      this.dialogVisible = false
    },
    doPrint(row) {
      this.HtmlData = row.name
      this.$refs.print.print(row.name)
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
