import Vue from 'vue';

import 'reset-css/reset.css';
import '@/styles/element-variables.scss';
import '@/styles/common.scss';

import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');
