<template>
  <div id="app">
    <div class="top">
      <span>{{ statusDesc }}</span>
      <div>
        <Progress
          :stroke-width="12"
          :percentage="Number(percentage.toFixed(2))"
          class="progress"
          text-inside/>
      </div>
    </div>
    <Button
      v-show="status === 'update-downloaded'"
      size="medium"
      type="primary"
      class="btn"
      @click="updateNow">
      更新并重启应用
    </Button>
  </div>
</template>

<script>
// eslint-disable-next-line
import { ipcRenderer } from 'electron';
import { Progress, Button } from 'element-ui';

export default {
  name: 'App',

  components: {
    Progress,
    Button,
  },

  data() {
    return {
      percentage: 0,
      status: '',
    };
  },

  computed: {
    statusDesc() {
      const statusMap = {
        'update-available': '发现新版本',
        'download-progress': '正在下载更新包',
        'update-downloaded': '更新包下载完成',
      };

      return statusMap[this.status || 'update-available'];
    },
  },

  created() {
    this.onVersionMessage();
  },

  methods: {
    onVersionMessage() {
      ipcRenderer.on('update-message', (event, { message, data }) => {
        this.status = message;
        if (message === 'download-progress') {
          const { percent } = data;
          this.percentage = percent;
        } else if (message === 'update-downloaded') {
          this.percentage = 100;
        }
      });
    },

    updateNow() {
      ipcRenderer.send('updateNow');
    },
  },
};
</script>

<style lang="scss" scoped>
/* stylelint-disable */
html,
body,
#app {
  width: 320px;
  height: 160px;
  overflow: hidden;
  -webkit-app-region: drag;
}

#app {
  padding: 0 40px;
  box-sizing: border-box;
}

.top {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 100%;
  height: 110px;
}

.progress {
  font-size: 12px;
}

.btn {
  float: right;
  -webkit-app-region: no-drag;
}
</style>
