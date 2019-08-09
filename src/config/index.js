// 自动更新路径
export const AUTO_UPDATE_URL = '/admin/CltUpdate/MallProCash'

export const PROJECT_NAME = 'ych-pro-cashier'

export const NODE_ENV = process.env.NODE_ENV || 'production'

export const IS_DEVELOP = process.env.NODE_ENV === 'development'

// 强制所有请求使用mock
export const AJAX_MOCK_ENABLE = false

export const DEFAULT_PATH = '/welcome'

// 路由默认配置，路由表并不从此注入
export const ROUTER_DEFAULT_CONFIG = {
  mode: 'hash',
  base: ''
  // waitForData: true,
  // transitionOnLoad: true
}

// axios 默认配置
export const AXIOS_DEFAULT_CONFIG = {
  timeout: 20000,
  maxContentLength: 2000,
  headers: {}
}

// vuex 默认配置
export const VUEX_DEFAULT_CONFIG = {
  strict: process.env.NODE_ENV !== 'production'
}

// CONST 默认配置
export const CONST_DEFAULT_CONFIG = {
  sep: '/'
}

// API 默认配置
export const API_DEFAULT_CONFIG = {
  // mockBaseURL: 'http://neidebug.youcaihua.net:8081/nei/mock',
  mockBaseURL: 'http://192.168.2.109:9999',
  mock: process.env.NODE_ENV !== 'production',
  debug: process.env.NODE_ENV !== 'production',
  sep: '/'
}

// 服务器连接状态测试接口地址
export const SERVER_TEST_PATH = '/ProfessionalCash/api/v1.0/Global/DTOConnectTest'

// 系统
export const SYSTEM_LOG_ENABLE = true

// 开启请求参数打印
export const CONSOLE_REQUEST_ENABLE = false
// 开启响应参数打印
export const CONSOLE_RESPONSE_ENABLE = false
