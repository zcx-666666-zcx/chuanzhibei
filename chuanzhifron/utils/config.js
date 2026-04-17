const {
  isProduction,
  DEVELOPMENT_API_BASE_URL,
  DEVELOPMENT_DEVICE_BASE_URL,
  DEVELOPMENT_DEVICE_BASE_URL_HTTPS,
  DEVELOPMENT_DEVTOOLS_HTTPS_BASE_URL,
  PRODUCTION_API_BASE_URL
} = require('./env.js')

const DEFAULT_BASE_URL = 'http://localhost:8001'
const API_PREFIX = '/api'
const DEFAULT_IMAGE_DATA_URI = 'data:image/svg+xml;utf8,' +
  encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f2f3f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="20">image unavailable</text></svg>');

function trimTrailingSlash(url) {
  return (url || '').replace(/\/+$/, '');
}

function ensureLeadingSlash(path) {
  if (!path) {
    return '';
  }
  return path.startsWith('/') ? path : `/${path}`;
}

function isLocalhostBaseUrl(url) {
  try {
    const m = String(url || '')
      .replace(/\/+$/, '')
      .match(/^https?:\/\/([^/:]+)/i)
    if (!m) return false
    const host = (m[1] || '').toLowerCase()
    return host === 'localhost' || host === '127.0.0.1'
  } catch (e) {
    return false
  }
}

function getRuntimePlatform() {
  try {
    return wx.getSystemInfoSync().platform || 'unknown'
  } catch (e) {
    return 'unknown'
  }
}

/**
 * 开发态根地址：
 * - devtools：可选走 DEVELOPMENT_DEVTOOLS_HTTPS_BASE_URL，避免 https 壳子请求 http 资源触发 Mixed Content
 * - 真机：可选 https，否则 http 局域网，否则回退到 DEVELOPMENT_API_BASE_URL（localhost 仅本机调试用）
 */
function resolveDevelopmentBaseUrl(dev) {
  const trimmed = (dev || '').trim()
  if (!trimmed) return trimmed

  const platform = getRuntimePlatform()

  if (platform === 'devtools') {
    const httpsTools = (DEVELOPMENT_DEVTOOLS_HTTPS_BASE_URL || '').trim()
    if (httpsTools) {
      return trimTrailingSlash(httpsTools)
    }
    return trimTrailingSlash(trimmed)
  }

  if (platform === 'ios' || platform === 'android' || platform === 'ohos') {
    const httpsDevice = (DEVELOPMENT_DEVICE_BASE_URL_HTTPS || '').trim()
    if (httpsDevice) {
      return trimTrailingSlash(httpsDevice)
    }
    const lan = (DEVELOPMENT_DEVICE_BASE_URL || '').trim()
    if (lan) {
      return trimTrailingSlash(lan)
    }
  }

  return trimTrailingSlash(trimmed)
}

function getBaseUrl() {
  const custom = wx.getStorageSync('apiBaseUrl')
  if (custom) {
    return trimTrailingSlash(custom)
  }
  if (!isProduction()) {
    const dev = (DEVELOPMENT_API_BASE_URL || '').trim()
    if (dev) {
      return trimTrailingSlash(resolveDevelopmentBaseUrl(dev))
    }
  }
  if (isProduction()) {
    const prod = (PRODUCTION_API_BASE_URL || '').trim()
    if (prod) {
      return trimTrailingSlash(prod)
    }
    console.error(
      '[config] 生产模式未配置 PRODUCTION_API_BASE_URL，请在 utils/env.js 填写 https 根地址，或运行时 wx.setStorageSync(\'apiBaseUrl\', \'https://...\')'
    )
  }
  return trimTrailingSlash(DEFAULT_BASE_URL)
}

function getApiBaseUrl() {
  return `${getBaseUrl()}${API_PREFIX}`;
}

function getStaticBaseUrl() {
  return getBaseUrl();
}

function buildApiUrl(path) {
  if (!path) {
    return getApiBaseUrl();
  }
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  return `${getApiBaseUrl()}${ensureLeadingSlash(path)}`;
}

function maybeRewriteAbsoluteStaticUrl(url) {
  const match = String(url || '').match(/^https?:\/\/([^/]+)(\/.*)?$/i)
  if (!match) {
    return url
  }
  const host = (match[1] || '').toLowerCase().split(':')[0]
  const suffix = match[2] || ''
  const currentBase = getStaticBaseUrl()
  const currentIsHttps = /^https:\/\//i.test(currentBase)
  const sourceIsHttp = /^http:\/\//i.test(url)
  const sourceIsLocal = host === 'localhost' || host === '127.0.0.1'

  // 小程序环境下，尽量避免 http 或 localhost 资源导致图片/视频无法展示。
  if (sourceIsLocal || (sourceIsHttp && currentIsHttps)) {
    return `${currentBase}${suffix}`
  }
  return url
}

function buildStaticUrl(path) {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//.test(path)) {
    return maybeRewriteAbsoluteStaticUrl(path);
  }
  return `${getStaticBaseUrl()}${ensureLeadingSlash(path)}`;
}

module.exports = {
  DEFAULT_BASE_URL,
  DEFAULT_IMAGE_DATA_URI,
  getBaseUrl,
  getApiBaseUrl,
  getStaticBaseUrl,
  buildApiUrl,
  buildStaticUrl
};
