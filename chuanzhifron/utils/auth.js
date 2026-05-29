/**
 * 用户认证工具函数
 */
const { request, requestErrorMessage } = require('./util.js')
const { saveSession, clearSession, getCurrentUser: readCurrentUser, hasSession } = require('./session.js')

const USERNAME_RE = /^[a-zA-Z0-9_\u4e00-\u9fa5]{2,20}$/
const EMAIL_RE = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9][A-Za-z0-9.-]*\.[A-Za-z]{2,}$/
const NICKNAME_MAX_LEN = 32

function validateUsername(username) {
  const value = (username || '').trim()
  if (!value) {
    return '请输入用户名'
  }
  if (!USERNAME_RE.test(value)) {
    return '用户名为 2～20 位中文、字母、数字或下划线'
  }
  return ''
}

function validatePassword(password) {
  const value = password || ''
  if (!value) {
    return '请输入密码'
  }
  if (value.length < 6) {
    return '密码至少 6 位'
  }
  if (value.length > 64) {
    return '密码最长 64 位'
  }
  return ''
}

function validateNickname(nickname) {
  const value = (nickname || '').trim()
  if (value.length > NICKNAME_MAX_LEN) {
    return '昵称最长 32 字'
  }
  return ''
}

function validateEmail(email) {
  const value = (email || '').trim()
  if (value && !EMAIL_RE.test(value)) {
    return '邮箱格式不正确'
  }
  return ''
}

function normalizeUserForStorage(user) {
  if (!user || typeof user !== 'object') {
    return null
  }
  const normalized = { ...user }
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
  return normalized
}

function persistSession(res) {
  const token = res.data?.token || res.token
  const user = normalizeUserForStorage(res.data?.user || res.user)
  saveSession({ token, user })
}

/**
 * 微信登录
 */
const wxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: res => {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(res)
        }
      },
      fail: err => {
        reject(err)
      }
    })
  })
}

/**
 * 用户名密码登录
 */
const loginWithUsername = (loginData) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    skipAuthRedirect: true,
    data: {
      username: (loginData.username || '').trim(),
      password: loginData.password || ''
    }
  })
    .then((res) => {
      if (res.success) {
        persistSession(res)
        return res
      }
      throw new Error(res.message || '登录失败')
    })
    .catch((err) => {
      return Promise.reject(new Error(requestErrorMessage(err)))
    })
}

/**
 * 微信资料登录（演示环境用 code 派生 openid）
 */
const loginToBackend = (userInfo) => {
  const loginOpenid = userInfo.openid || (userInfo.wxCode ? `wx_${userInfo.wxCode}` : '')
  return request({
    url: '/auth/login',
    method: 'POST',
    skipAuthRedirect: true,
    data: {
      openid: loginOpenid,
      wxCode: userInfo.wxCode || '',
      nickname: userInfo.nickName || '',
      avatarUrl: userInfo.avatarUrl || '',
      gender: userInfo.gender || '',
      country: userInfo.country || '',
      province: userInfo.province || '',
      city: userInfo.city || '',
      language: userInfo.language || ''
    }
  })
    .then((res) => {
      if (res.success) {
        persistSession(res)
        return res
      }
      throw new Error(res.message || '登录失败')
    })
    .catch((err) => {
      return Promise.reject(new Error(requestErrorMessage(err)))
    })
}

/**
 * 用户注册（成功后与登录相同写入 token，可直接进入首页）
 */
const registerUser = (registerData) => {
  return request({
    url: '/auth/register',
    method: 'POST',
    skipAuthRedirect: true,
    data: {
      username: (registerData.username || '').trim(),
      password: registerData.password || '',
      email: (registerData.email || '').trim(),
      nickname: (registerData.nickname || '').trim()
    }
  })
    .then((res) => {
      if (res.success) {
        persistSession(res)
        return res
      }
      throw new Error(res.message || '注册失败')
    })
    .catch((err) => {
      return Promise.reject(new Error(requestErrorMessage(err)))
    })
}

/**
 * 用户登出
 */
const logout = () => {
  clearSession()
}

/**
 * 检查是否已登录
 */
const isLoggedIn = () => {
  return hasSession()
}

/**
 * 获取当前用户信息
 */
const getCurrentUser = () => {
  return readCurrentUser()
}

module.exports = {
  wxLogin,
  loginWithUsername,
  loginToBackend,
  registerUser,
  validateUsername,
  validatePassword,
  validateNickname,
  validateEmail,
  logout,
  isLoggedIn,
  getCurrentUser
}
