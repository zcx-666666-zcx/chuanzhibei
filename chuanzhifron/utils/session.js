const { request, requestErrorMessage } = require('./util.js')
const { buildStaticUrl } = require('./config.js')
const storage = require('./storage.js')

function normalizeUser(user) {
  if (!user || typeof user !== 'object') {
    return null
  }
  const normalized = Object.assign({}, user)
  if (!normalized.userId && normalized.id) {
    normalized.userId = normalized.id
  }
  if (!normalized.id && normalized.userId) {
    normalized.id = normalized.userId
  }
  if (!normalized.nickName && normalized.nickname) {
    normalized.nickName = normalized.nickname
  }
  if (!normalized.nickname && normalized.nickName) {
    normalized.nickname = normalized.nickName
  }
  if (normalized.avatarUrl && !/^https?:\/\//.test(normalized.avatarUrl)) {
    normalized.avatarUrl = buildStaticUrl(normalized.avatarUrl)
  }
  normalized.displayName =
    normalized.displayName ||
    normalized.nickname ||
    normalized.nickName ||
    normalized.username ||
    '访客'
  normalized.displayTitle = normalized.displayTitle || normalized.signature || '非遗文化爱好者'
  return normalized
}

function setCurrentUser(user) {
  const normalized = normalizeUser(user)
  if (!normalized) {
    return null
  }
  storage.set(storage.KEYS.userInfo, normalized)
  try {
    const app = typeof getApp === 'function' ? getApp() : null
    if (app && app.globalData) {
      app.globalData.userInfo = normalized
    }
  } catch (e) {
    // ignore
  }
  return normalized
}

function getCurrentUser() {
  return normalizeUser(storage.get(storage.KEYS.userInfo, null))
}

function getToken() {
  return storage.get(storage.KEYS.token, '')
}

function hasSession() {
  return Boolean(getToken() && getCurrentUser())
}

function saveSession(payload) {
  const token = payload && (payload.token || payload.data?.token)
  const user = payload && (payload.user || payload.data?.user)
  if (token) {
    storage.set(storage.KEYS.token, token)
  }
  if (user) {
    setCurrentUser(user)
  }
}

function clearSession() {
  storage.clearSession()
  try {
    const app = typeof getApp === 'function' ? getApp() : null
    if (app && app.globalData) {
      app.globalData.userInfo = null
    }
  } catch (e) {
    // ignore
  }
}

function loadClientConfig(forceRefresh) {
  const cached = storage.get(storage.KEYS.clientConfig, null)
  if (cached && !forceRefresh) {
    return Promise.resolve(cached)
  }
  return request({
    url: '/app/config'
  }).then((res) => {
    const config = (res && res.data) || {}
    storage.set(storage.KEYS.clientConfig, config)
    return config
  }).catch((err) => {
    if (cached) {
      return cached
    }
    throw new Error(requestErrorMessage(err))
  })
}

function bootstrapSession() {
  const user = getCurrentUser()
  try {
    const app = typeof getApp === 'function' ? getApp() : null
    if (app && app.globalData) {
      app.globalData.userInfo = user
    }
  } catch (e) {
    // ignore
  }
  return loadClientConfig(false)
    .catch(() => ({}))
    .then((clientConfig) => ({
      loggedIn: hasSession(),
      user,
      clientConfig
    }))
}

module.exports = {
  bootstrapSession,
  clearSession,
  getCurrentUser,
  getToken,
  hasSession,
  loadClientConfig,
  normalizeUser,
  saveSession,
  setCurrentUser
}
