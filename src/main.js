import Vue from 'vue'
import ElementUI from 'element-ui'
import inject from './plugins/inject'
import App from './App.vue'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(inject)

Vue.config.productionTip = false
Vue.use(ElementUI, {
  size: 'small',
  zIndex: 3000
})
new Vue({
  render: h => h(App)
}).$mount('#app')
