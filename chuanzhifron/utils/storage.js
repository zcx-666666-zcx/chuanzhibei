const KEYS = {
  token: 'token',
  userInfo: 'userInfo',
  clientConfig: 'clientConfig',
  favoriteMasterIds: 'favoriteMasterIds'
}

function get(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    return value === '' || value === undefined ? fallback : value
  } catch (_e) {
    return fallback
  }
}

function set(key, value) {
  wx.setStorageSync(key, value)
  return value
}

function remove(key) {
  wx.removeStorageSync(key)
}

function clearSession() {
  remove(KEYS.token)
  remove(KEYS.userInfo)
}

module.exports = {
  KEYS,
  get,
  set,
  remove,
  clearSession
}
