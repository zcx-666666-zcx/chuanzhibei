const { isProduction, DEVELOPMENT_API_BASE_URL, PRODUCTION_API_BASE_URL } = require('./env.js')

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

function getBaseUrl() {
  const custom = wx.getStorageSync('apiBaseUrl')
  if (custom) {
    return trimTrailingSlash(custom)
  }
  if (!isProduction()) {
    const dev = (DEVELOPMENT_API_BASE_URL || '').trim()
    if (dev) {
      return trimTrailingSlash(dev)
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
