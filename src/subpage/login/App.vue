<template>
  <div class="login-wrap">
    <div class="flat-img">
      <img src="../../assets/flat.png">
    </div>
    <div class="slogan-img">
      <img src="../../assets/slogan.png">
    </div>
    <div class="shadow-img">
      <img src="../../assets/shadow.png">
    </div>
    <div
      class="back-img"
      @click="close">
      <img src="../../assets/back.png">
    </div>
    <el-card
      v-loading="formLoading"
      element-loading-text="正在连接服务器"
      class="login-form">
      <div class="logo-img">
        <img src="../../assets/logo.png">
      </div>
      <el-form
        ref="form"
        :model="formData"
        :rules="rules"
        label-position="right"
        label-width="80px"
        @keyup.enter.native="submitForm">
        <el-form-item
          label="收银终端"
          prop="TerminalID">
          <el-select
            ref="selectInp"
            v-model="formData.TerminalID"
            clearable
            placeholder="请选择"
            @visible-change="changeValue">
            <el-option
              v-for="item in termOptions"
              :key="item.Value"
              :label="item.Text"
              :value="item.Value"/>
          </el-select>
        </el-form-item>
        <el-form-item
          placeholder="请输入账号"
          prop="UserName">
          <span slot="label">账&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;号</span>
          <el-input
            ref="nameInp"
            v-model="formData.UserName"
            autofocus="true"/>
        </el-form-item>
        <el-form-item
          placeholder="请输入密码"
          prop="PassWord">
          <span slot="label">密&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;码</span>
          <el-input
            ref="passWordInp"
            v-model="formData.PassWord"
            type="password"/>
        </el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="login-btn"
          @click="submitForm">
          登录
        </el-button>
      </el-form>
    </el-card>
    <div class="bottom-img">
      <img
        class="arc-img"
        src="../../assets/information.png">
    </div>
    <span class="circle left-top"/>
    <span class="circle left-bottom"/>
    <span class="circle bottom"/>
    <span class="circle right-top"/>
    <span class="circle right"/>
    <span class="circle right-bottom"/>
    <div class="model-left"/>
  </div>
</template>

<script type="text/javascript">
/* eslint import/no-extraneous-dependencies: 0 */
import { remote, ipcRenderer } from 'electron';
import {
  Form,
  FormItem,
  Input,
  Button,
  Select,
  Card,
  Option,
} from 'element-ui';
import { IS_DEVELOP, API_DEFAULT_CONFIG } from '@/config';
import ajax from '@/plugins/axios';
import os from 'os';
import crypto from 'crypto';

const electronStore = remote.getGlobal('electronStore');
const host = IS_DEVELOP ? API_DEFAULT_CONFIG.mockBaseURL : electronStore.get('host');

export default {
  name: 'Login',

  components: {
    [Form.name]: Form,
    [FormItem.name]: FormItem,
    [Input.name]: Input,
    [Button.name]: Button,
    [Select.name]: Select,
    [Card.name]: Card,
    [Option.name]: Option,
  },

  data() {
    return {
      formData: {
        UserName: null,
        PassWord: null,
        TerminalID: null,
        PeriodID: null,
        Mac: null,
      },
      termOptions: [],
      rules: {
        UserName: [
          {
            required: true, message: '请输入账号', trigger: 'blur',
          },
        ],
        PassWord: [
          {
            required: true, message: '请输入密码', trigger: 'blur',
          },
        ],
        TerminalID: [
          {
            required: true, message: '请选择终端', trigger: 'change',
          },
        ],
      },

      loading: false,
      formLoading: true,
      loaded: false,
    };
  },

  beforeCreate() {
    if (!IS_DEVELOP) {
      ipcRenderer.send('checkVersion');
    }
  },

  created() {
    Promise.all([this.getLoginTerminal(), this.getTerminalByMac()])
      .then(([first = [], second = {}]) => {
        // 判断绑定的终端是否存在终端列表
        const hasTerminalID = first.find(item => item.Value === second.ID);
        this.formLoading = false;
        if (this.loaded && second.ID && hasTerminalID) {
          this.formData.TerminalID = second.ID;
        }
      });
  },

  methods: {
    changeValue(val) {
      if (!val) {
        this.$refs.selectInp.blur();
        this.$refs.nameInp.focus();
      }
    },
    submitForm() {
      if (this.loading) return;
      if (this.formData.UserName) {
        if (!this.formData.PassWord) {
          this.$refs.nameInp.blur();
          this.$refs.passWordInp.focus();
        }
      } else {
        this.$refs.nameInp.focus();
        this.$refs.passWordInp.blur();
      }
      this.$refs.form.validate((valid) => {
        if (!valid) return;
        this.loading = true;
        const postData = Object.assign({}, this.formData);
        const encryptedPwd = window.btoa(this.formData.PassWord);
        postData.PassWord = encryptedPwd;
        this.login(postData);
      });
    },
    getLoginTerminal() {
      return new Promise((resolve) => {
        ajax.post(`${host}/ProfessionalCash/api/v1.0/Login/GetLoginTerminal`).then((res) => {
          this.loaded = true;
          this.termOptions = res.TerminalList;
          resolve(res.TerminalList);
        }, () => {
          resolve();
        });
      });
    },
    getTerminalByMac() {
      return new Promise((resolve) => {
        const hashMac = Object.values(os.networkInterfaces()).find(item => item[0].mac !== '00:00:00:00:00:00');
        // 未插网线无网络时
        if (!hashMac) {
          resolve();
          return;
        }
        const userMac = hashMac[0].mac;
        const hash = crypto.createHash('md5');
        hash.update(userMac);
        const resultMac = hash.digest('hex');
        this.formData.Mac = resultMac;
        ajax.post(
          `${host}/ProfessionalCash/api/v1.0/Terminal/GetTerminalByMac`,
          { Mac: resultMac },
        ).then((res) => {
          resolve(res);
        }, () => {
          resolve();
        });
      });
    },
    login(postData) {
      ajax.post(
        `${host}/ProfessionalCash/api/v1.0/Login/CashLogin`,
        postData,
      ).then((res) => {
        sessionStorage.setItem('user', JSON.stringify(res || null));
        this.loading = false;
        ipcRenderer.send('login-after');
      }, () => {
        this.loading = false;
      });
    },
    close() {
      ipcRenderer.send('login-close');
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import "@/styles/theme.scss";
.login-wrap {
  width: 100%;
  height: 100vh;
  min-height: 600px;
  position: relative;
  //stylelint-disable-next-line
  background: linear-gradient(to bottom right, #52A5FF, #0058CC);
}

/deep/ .el-form-item__label::before {
  content: ''!important;
  margin-left: 0 !important;
}

/deep/.el-input__inner {
  -webkit-app-region: no-drag;
}

.flat-img {
  width: 437px;
  height: 402px;
  position: absolute;
  left: 60px;
  top: 70px;
  z-index: 1;
  animation: circle4 3.5s linear infinite;
  img {
    width: 437px;
    height: 402px;
  }
}
.shadow-img {
  width: 471px;
  height: 280px;
  position: absolute;
  left: 40px;
  top: 230px;
  img {
    width: 471px;
    height: 280px;
  }
}
.slogan-img {
  width: 141px;
  height: 65px;
  position: absolute;
  left: 75px;
  top: 105px;
  img {
    width: 141px;
    height: 65px;
  }
}
.back-img {
  width: 38px;
  height: 18px;
  position: absolute;
  top: 16px;
  right: 30px;
  opacity: .5;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }
  img {
    width: 38px;
    height: 18px;
  }
}
.login-form {
  width: 380px;
  height: 400px;
  position: absolute;
  right: 30px;
  top: 60px;
  border-radius: $border-radius;
  background-color: $color-white;
  border: 0;
  padding-top: 11px;
  box-sizing: border-box;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .2);
  /deep/ .el-form {
    padding: 26px 20px 20px;
  }
  /deep/ .el-card__body {
    padding: 0;
  }
  /deep/ .el-select {
    width: 260px;
  }
}
.logo-img  {
  width: 380px;
  height: 101px;
  img {
    width: 380px;
    height: 101px;
  }
}
.bottom-img {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 160px;
  background: url('../../assets/arc.png') no-repeat center;
  background-size: 100% 100%;
  display: flex;
  justify-content: flex-end;
}
.arc-img {
  width: 250px;
  height: 80px;
  margin: 62px 108px 18px 0;
}
.login-btn {
  width: 100%;
  margin-top: 18px;
  border: 0;
  //stylelint-disable-next-line
  background:linear-gradient(to  right, #52A5FF, #0058CC);
  &:hover {
    background: linear-gradient(to  right, $color-primary, $color-primary);
  }
}

.model-left {
  width: 550px;
  height: 100%;
  position: fixed;
  left: 0;
  top: 0;
  background-color: transparent;
  -webkit-app-region: drag;
}
.circle {
  position: fixed;
  border-radius: $border-radius-circle;
  background-color: rgba($color-white, .5);
}
.left-top {
  width: 16px;
  height: 16px;
  left: 55px;
  top: 180px;
  background-color: rgba($color-white, .2);
}
.left-bottom {
  width: 24px;
  height: 24px;
  left: 20px;
  top: 415px;
  background-color: rgba($color-white, .2);
}
.bottom {
  width: 44px;
  height: 44px;
  left: 135px;
  top: 482px;
  animation: circle4 3s linear infinite;
}
.right-top {
  width: 36px;
  height: 36px;
  left: 450px;
  top: 150px;
  animation: circle3 4s linear infinite;
}
.right {
  width: 16px;
  height: 16px;
  left: 544px;
  top: 364px;
}
.right-bottom {
  width: 8px;
  height: 8px;
  left: 485px;
  top: 414px;
}
@keyframes circle3{
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0, -20px);
  }
  100% {
    transform: translate(0, 0);
  }
}
@keyframes circle4{
  0% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0, -10px);
  }
  100% {
    transform: translate(0, 0);
  }
}
</style>
