const { request, requestErrorMessage } = require('../utils/util.js')
const { saveSession, clearSession } = require('../utils/session.js')

function loginWithUsername(payload) {
  return request({
    url: '/auth/login',
    method: 'POST',
    skipAuthRedirect: true,
    data: {
      username: (payload.username || '').trim(),
      password: payload.password || ''
    }
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '登录失败')
    }
    saveSession(res)
    return res.data || {}
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function loginWithWechat(payload) {
  return request({
    url: '/auth/login',
    method: 'POST',
    skipAuthRedirect: true,
    data: payload
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '登录失败')
    }
    saveSession(res)
    return res.data || {}
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function logout() {
  clearSession()
}

module.exports = {
  loginWithUsername,
  loginWithWechat,
  logout
}
