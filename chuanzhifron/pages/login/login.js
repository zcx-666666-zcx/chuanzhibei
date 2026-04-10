// pages/login/login.js
const { loginToBackend, loginWithUsername, validateUsername, validatePassword } = require('../../utils/auth.js')
const { buildStaticUrl, DEFAULT_IMAGE_DATA_URI } = require('../../utils/config.js')

Page({
  data: {
    currentTab: 0,
    username: '',
    password: '',
    canIUseGetUserProfile: false,
    tempLoginCode: '',
    logoUrl: buildStaticUrl('/uploads/login-bg.png.png'),
    submitting: false
  },

  onLoad() {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1]
    const options = (current && current.options) || {}
    this.setData({
      canIUseGetUserProfile: wx.canIUse('getUserProfile')
    })
    if (options.username) {
      this.setData({
        currentTab: 0,
        username: decodeURIComponent(options.username)
      })
    }
  },

  onLogoError() {
    this.setData({ logoUrl: DEFAULT_IMAGE_DATA_URI })
  },

  switchTabHandler(e) {
    const tab = parseInt(e.currentTarget.dataset.tab, 10)
    this.setData({ currentTab: tab })
  },

  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    })
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onLogin() {
    const { username, password, submitting } = this.data
    if (submitting) return

    const u = (username || '').trim()
    const usernameError = validateUsername(u)
    if (usernameError) {
      wx.showToast({ title: usernameError, icon: 'none' })
      return
    }
    const passwordError = validatePassword(password)
    if (passwordError) {
      wx.showToast({ title: passwordError, icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    loginWithUsername({ username: u, password })
      .then(() => {
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 600)
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ submitting: false })
      })
  },

  onWechatLogin() {
    if (this.data.submitting) return
    wx.login({
      success: (res) => {
        if (res.code) {
          if (this.data.canIUseGetUserProfile) {
            this.setData({ tempLoginCode: res.code })
            wx.showModal({
              title: '需要授权',
              content: '为展示头像与昵称，需要获取您的微信公开资料（仅用于本小程序）',
              showCancel: true,
              confirmText: '去授权',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  this.onGetUserProfile()
                }
              }
            })
          } else {
            wx.getUserInfo({
              success: (userInfos) => {
                this.loginToServer(res.code, userInfos.userInfo)
              },
              fail: () => {
                wx.showToast({ title: '需要授权才能登录', icon: 'none' })
              }
            })
          }
        } else {
          wx.showToast({ title: '微信登录失败', icon: 'none' })
        }
      },
      fail: () => {
        wx.showToast({ title: '微信登录失败', icon: 'none' })
      }
    })
  },

  onGetUserProfile() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (userProfileRes) => {
        this.loginToServer(this.data.tempLoginCode, userProfileRes.userInfo)
      },
      fail: () => {
        wx.showToast({ title: '授权失败', icon: 'none' })
      }
    })
  },

  loginToServer(code, userInfo) {
    this.setData({ submitting: true })
    const loginData = {
      ...userInfo,
      wxCode: code
    }
    loginToBackend(loginData)
      .then(() => {
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 600)
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ submitting: false })
      })
  }
})
