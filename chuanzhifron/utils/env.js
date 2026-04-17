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
 * 开发环境 API 根地址：仅用于微信开发者工具（一般为 http://localhost:8001）。
 * 不要填局域网 IP：工具内页面是 https，请求 http 视频会触发 Mixed Content 被拦截。
 */
const DEVELOPMENT_API_BASE_URL = 'http://localhost:8001'

/**
 * 真机预览（iOS/Android）使用的 http 根地址，与手机同一局域网，例如 http://192.168.1.8:8001。
 * 工具内 (platform=devtools) 不会使用此项。
 */
const DEVELOPMENT_DEVICE_BASE_URL = ''

/**
 * 真机预览时可选的 https 根地址（穿透或本机证书）。若填则真机优先用 https，避免部分环境下 http 被拦。
 */
const DEVELOPMENT_DEVICE_BASE_URL_HTTPS = ''

/**
 * 开发者工具内可选的 https 根地址（如内网穿透 https://xxx.vicp.fun），与本地后端数据一致即可。
 * 填后工具内请求/静态资源走 https，可避免「https 页面请求 http 视频」的 Mixed Content。
 * 留空则工具内仍用 DEVELOPMENT_API_BASE_URL（http localhost，音视频在工具里可能被拦截）。
 */
const DEVELOPMENT_DEVTOOLS_HTTPS_BASE_URL = ''

/**
 * 生产环境 API 根地址：须 https；留空则回退到 config.js 的 DEFAULT_BASE_URL。上线前填写正式域名。
 */
const PRODUCTION_API_BASE_URL = ''

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
  DEVELOPMENT_DEVICE_BASE_URL,
  DEVELOPMENT_DEVICE_BASE_URL_HTTPS,
  DEVELOPMENT_DEVTOOLS_HTTPS_BASE_URL,
  PRODUCTION_API_BASE_URL,
  USE_MOCK_IN_DEVELOPMENT,
  isProduction,
  useMockApi
}
