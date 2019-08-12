<template>
  <div id="app">
    <el-button type="primary" @click="showPrint">设置打印机</el-button>
    <printDialog :dialog-visible="dialogVisible" @cancel="handlePrintDialogCancel" />
    <pinter ref="print" :html-data="HtmlData"></pinter>
    <el-table :data="tableData" style="width: 100%">
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
        name: '我是小仙女',
        address: '上海市浦东新区',
        tag: '家'
      }, {
        date: '2016-05-04',
        name: '我是小仙女1',
        address: '上海市浦东新区',
        tag: '公司'
      }, {
        date: '2016-05-01',
        name: '我是小仙女2',
        address: '上海市浦东新区',
        tag: '家'
      }, {
        date: '2016-05-03',
        name: '我是小仙女3',
        address: '上海市浦东新区',
        tag: '公司'
      }]
    }
  },
  mounted() {
  },
  methods: {
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
