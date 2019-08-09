<template>
  <div>
    <el-dialog width="300px" :visible="dialogVisible" :append-to-body="true" :show-close="false" title="打印机设置">
      <el-table :data="printList" highlight-current-row border @current-change="handleCurrentChange">
        <el-table-column label="打印机名称">
          <template slot-scope="scope">
            {{ scope.row.name }}
            <el-tag v-if="scope.row.name==defaultPrint" type="primary" disable-transitions>默认</el-tag>
          </template>
        </el-table-column>
        <div slot="empty">
          暂无可用打印机
        </div>
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
    defaultPrint() {
      return this.$electronStore.get('printForm') || ''
    }
  },
  watch: {
    dialogVisible: {
      immediate: true,
      handler: 'getPrintListHandle'
    },
  },
  methods: {
    // 获取打印机列表
    getPrintListHandle(dialogVisible) {
      if (!dialogVisible) {
        return
      }
      // 改用ipc异步方式获取列表，解决打印列数量多的时候导致卡死的问题
      ipcRenderer.send('getPrinterList')
      ipcRenderer.once('getPrinterList', (event, data) => {
        // 过滤可用打印机
        this.printList = data.filter(element => element.status === 0)
      })
    },
    handleCurrentChange(row) {
      this.rowData = row
    },
    // 取消
    cancel() {
      this.dialogVisible = false
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
