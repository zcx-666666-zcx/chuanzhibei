const { validateUsername, validatePassword } = require('../../utils/auth.js')
const { DEFAULT_IMAGE_DATA_URI, buildStaticUrl } = require('../../utils/config.js')
const { createPageState, patchPageState } = require('../../utils/page-state.js')
const { loginWithUsername, loginWithWechat } = require('../../services/auth.service.js')
const { hasSession, loadClientConfig } = require('../../utils/session.js')

Page({
  data: {
    currentTab: 0,
    username: '',
    password: '',
    canIUseGetUserProfile: false,
    tempLoginCode: '',
    logoUrl: buildStaticUrl('/uploads/login-bg.png.png'),
    submitting: false,
    clientConfig: {},
    pageState: createPageState()
  },

  onLoad() {
    if (hasSession()) {
      wx.switchTab({ url: '/pages/index/index' })
      return
    }

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

    loadClientConfig(false).then((clientConfig) => {
      const config = clientConfig || {}
      const usernameLoginEnabled = config.usernameLoginEnabled !== false
      const wechatLoginEnabled = config.wechatLoginEnabled !== false
      let currentTab = this.data.currentTab
      if (!usernameLoginEnabled && wechatLoginEnabled) {
        currentTab = 1
      }
      this.setData({
        clientConfig: config,
        currentTab
      })
    }).catch(() => {})
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

    const normalizedUsername = (username || '').trim()
    const usernameError = validateUsername(normalizedUsername)
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
    patchPageState(this, { loading: true, error: '' })
    loginWithUsername({ username: normalizedUsername, password })
      .then(() => {
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 500)
      })
      .catch((err) => {
        patchPageState(this, { error: err.message || '登录失败' })
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ submitting: false })
        patchPageState(this, { loading: false })
      })
  },

  onWechatLogin() {
    if (this.data.submitting) return
    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.showToast({ title: '微信登录失败', icon: 'none' })
          return
        }
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
          return
        }
        wx.getUserInfo({
          success: (userInfos) => {
            this.loginToServer(res.code, userInfos.userInfo)
          },
          fail: () => {
            wx.showToast({ title: '需要授权才能登录', icon: 'none' })
          }
        })
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
    patchPageState(this, { loading: true, error: '' })
    loginWithWechat({
      ...userInfo,
      wxCode: code,
      openid: userInfo.openid || ''
    })
      .then(() => {
        wx.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 500)
      })
      .catch((err) => {
        patchPageState(this, { error: err.message || '登录失败' })
        wx.showToast({
          title: err.message || '登录失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ submitting: false })
        patchPageState(this, { loading: false })
      })
  }
})
