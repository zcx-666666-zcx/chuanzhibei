/**
 * 环境与发布开关
 *
 * 本地开发（默认）：APP_ENV = development，可配合 USE_MOCK_IN_DEVELOPMENT 走 mock。
 * 上传体验版 / 正式版前：改为 APP_ENV = production，填写 PRODUCTION_API_BASE_URL（https），
 *   并在小程序后台配置 request / uploadFile / downloadFile 合法域名。
 */
const APP_ENV = 'development'

/** 开发环境下是否走 mockApi（当前为前后端联调测试，默认关闭） */
const USE_MOCK_IN_DEVELOPMENT = false

/**
 * 开发环境 API 根地址：建议使用可公网访问的 https（便于真机调试图片/视频）。
 */
const DEVELOPMENT_API_BASE_URL = 'https://1151290dt34oy.vicp.fun'

/**
 * 生产环境 API 根地址：须 https，无尾部斜杠；仅当 APP_ENV === 'production' 且未设置 Storage 里的 apiBaseUrl 时使用。
 * 示例：https://api.example.com
 */
const PRODUCTION_API_BASE_URL = 'https://1151290dt34oy.vicp.fun'

function isProduction() {
  return APP_ENV === 'production'
}

/** 为 true 时 app.js 注入演示账号、request 走 mockApi（生产环境强制为 false） */
function useMockApi() {
  if (isProduction()) return false
  return USE_MOCK_IN_DEVELOPMENT
}

module.exports = {
  APP_ENV,
  DEVELOPMENT_API_BASE_URL,
  PRODUCTION_API_BASE_URL,
  USE_MOCK_IN_DEVELOPMENT,
  isProduction,
  useMockApi
}
