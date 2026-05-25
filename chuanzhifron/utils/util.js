/**
 * 格式化时间显示
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的时间字符串
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

/**
 * 格式化数字，不足两位前面补0
 * @param {number|string} n 数字
 * @returns {string} 格式化后的字符串
 */
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const { buildApiUrl } = require('./config')
const { mockRequest } = require('./mockApi.js')

let loginRedirectScheduled = false

/**
 * 将请求异常转为用户可读短文案（超时、网络、HTTP、业务 message）
 */
function requestErrorMessage(err) {
  const status = err && err.statusCode
  const msg = (err && err.message) || ''
  if (status === 401) {
    return '登录已失效，请重新登录'
  }
  if (/timed?\s*out|超时/i.test(msg)) {
    return '请求超时，请检查网络后重试'
  }
  if (/网络请求失败|request:fail|连接|CONNECTION/i.test(msg)) {
    return '网络不可用，请稍后重试'
  }
  if (/HTTP 5\d\d/.test(msg)) {
    return '服务暂时不可用，请稍后重试'
  }
  const stripped = msg.replace(/^HTTP \d+:\s*/, '').trim()
  return stripped || '请求失败，请稍后重试'
}

function scheduleReloginNavigation() {
  if (loginRedirectScheduled) {
    return
  }
  loginRedirectScheduled = true
  wx.showToast({ title: '登录已过期', icon: 'none', duration: 2000 })
  setTimeout(() => {
    loginRedirectScheduled = false
    wx.navigateTo({ url: '/pages/login/login' })
  }, 500)
}

/**
 * 网络请求工具函数
 * @param {Object} options 请求参数
 * @returns {Promise} 返回Promise对象
 */
const request = (options) => {
  try {
    const app = getApp()
    if (app && app.globalData && app.globalData.localDataMode) {
      return mockRequest(options)
    }
  } catch (_e) {
    // getApp 在极少数初始化时序下不可用，继续走真实请求
  }

  const token = wx.getStorageSync('token')
  const timeout = options.timeout || 15000

  return new Promise((resolve, reject) => {
    wx.request({
      url: buildApiUrl(options.url),
      method: options.method || 'GET',
      data: options.data || {},
      timeout,
      header: {
        'content-type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const payload = res.data
          if (payload && typeof payload === 'object' && payload.success === false) {
            const message = payload.message || payload.error || '请求失败'
            const error = new Error(message)
            error.response = payload
            reject(error)
            return
          }
          resolve(payload)
          return
        }

        const message = (res.data && (res.data.message || res.data.error)) || res.errMsg || '请求失败'

        if (res.statusCode === 401) {
          const error = new Error(`HTTP 401: ${message}`)
          error.statusCode = 401
          reject(error)
          // 登录/注册接口的 401（如密码错误）不应清 token、不应跳转登录页
          if (!options.skipAuthRedirect) {
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            scheduleReloginNavigation()
          }
          return
        }

        if (res.statusCode === 403) {
          const error = new Error(`HTTP 403: ${message}`)
          error.statusCode = 403
          reject(error)
          return
        }

        const httpError = new Error(`HTTP ${res.statusCode}: ${message}`)
        httpError.statusCode = res.statusCode
        reject(httpError)
      },
      fail(err) {
        const error = new Error(`网络请求失败: ${err.errMsg || 'unknown'}`)
        error.requestFail = true
        reject(error)
      }
    })
  })
}

module.exports = {
  formatTime,
  request,
  requestErrorMessage
}
