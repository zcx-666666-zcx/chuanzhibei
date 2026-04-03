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
  } catch (e) {
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

        if (res.statusCode === 401 || res.statusCode === 403) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
        }

        const message = (res.data && (res.data.message || res.data.error)) || res.errMsg || '请求失败'
        reject(new Error(`HTTP ${res.statusCode}: ${message}`))
      },
      fail(err) {
        reject(new Error(`网络请求失败: ${err.errMsg}`))
      }
    })
  })
}

module.exports = {
  formatTime,
  request
}