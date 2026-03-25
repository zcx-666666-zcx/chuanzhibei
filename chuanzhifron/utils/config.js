const DEFAULT_BASE_URL = 'http://localhost:8001';
const API_PREFIX = '/api';
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
  const custom = wx.getStorageSync('apiBaseUrl');
  return trimTrailingSlash(custom || DEFAULT_BASE_URL);
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

function buildStaticUrl(path) {
  if (!path) {
    return '';
  }
  if (/^https?:\/\//.test(path)) {
    return path;
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
