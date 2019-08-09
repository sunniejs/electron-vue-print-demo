<template>
  <div id="app">
    <div class="top">
      <!-- <span></span> -->
      <Form
        ref="form"
        :model="formData"
        :rules="rules"
        :disabled="testing"
        label-position="left"
        size="medium"
        @submit.native.prevent
        @keyup.enter.native="test">
        <FormItem
          prop="host"
          label="服务器地址">

          <el-input
            v-model.trim="formData.host"
            placeholder="例子：http://192.168.1.1:9999"/>
        </FormItem>
      </Form>
    </div>
    <Button
      :loading="testing"
      size="medium"
      type="primary"
      class="btn"
      @click="test">
      确认并测试
    </Button>
  </div>
</template>

<script>
// eslint-disable-next-line
import { ipcRenderer, remote } from 'electron';
import { Button, Form, FormItem, Input } from 'element-ui';
import { trim } from 'lodash';
import ajax from 'axios';

import { SERVER_TEST_PATH } from '@/config';

export default {
  name: 'App',

  components: {
    Button,
    Form,
    FormItem,
    [Input.name]: Input,
  },

  data() {
    const validateHost = (rule, value, callback) => {
      if (this.checking) return;
      this.checking = true;
      if (value === '') {
        callback(new Error('请输入服务器地址'));
      } else {
        const reg = /\w+:\/\/[^/:]+:\d*?/;
        if (!reg.test(value)) {
          callback(new Error('请输入正确格式服务器地址,例如：http://192.168.1.1:9999'));
        } else {
          this.testing = true;
          let host = trim(this.formData.host);
          host = host.toString().toLowerCase();
          ajax.post(`${host}${SERVER_TEST_PATH}`, null, {
            errorCodeIgnore: true,
          }).then(() => {
            this.testing = false;
            ipcRenderer.send('service-test-success', this.formData.host);
          }, () => {
            callback(new Error('服务器连接失败！'));
            this.testing = false;
          });
        }
      }
    };
    return {
      formData: {
        host: null,
      },
      rules: {
        host: [
          { validator: validateHost, trigger: 'blur' },
        ],
      },
      testing: false,
      checking: false,
    };
  },

  mounted() {
    this.formData.host = remote.getGlobal('electronStore').get('host', null);
  },

  methods: {
    test() {
      this.checking = false;
      this.$refs.form.validate();
    },
  },
};
</script>

<style lang="scss">
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
  padding: 10px 40px 0;
  box-sizing: border-box;
}

.top {
  width: 100%;
}

label {
  font-size: 16px !important;
}

input {
  -webkit-app-region: no-drag;
}

.btn {
  float: right;
  -webkit-app-region: no-drag;
}
</style>
