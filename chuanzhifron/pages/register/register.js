// pages/register/register.js
const {
  registerUser,
  validateUsername,
  validatePassword,
  validateEmail,
  validateNickname
} = require('../../utils/auth.js')
const { buildStaticUrl, DEFAULT_IMAGE_DATA_URI } = require('../../utils/config.js')

Page({
  data: {
    username: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    email: '',
    logoUrl: buildStaticUrl('/uploads/login-bg.png.png'),
    submitting: false
  },

  onLogoError() {
    this.setData({ logoUrl: DEFAULT_IMAGE_DATA_URI })
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  onConfirmPasswordInput(e) {
    this.setData({ confirmPassword: e.detail.value })
  },

  onEmailInput(e) {
    this.setData({ email: e.detail.value })
  },

  goToLogin() {
    wx.navigateBack()
  },

  onRegister() {
    const { username, nickname, password, confirmPassword, email, submitting } = this.data
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
    if (password !== confirmPassword) {
      wx.showToast({ title: '两次密码不一致', icon: 'none' })
      return
    }

    const em = (email || '').trim()
    const emailError = validateEmail(em)
    if (emailError) {
      wx.showToast({ title: emailError, icon: 'none' })
      return
    }

    const nick = (nickname || '').trim()
    const nicknameError = validateNickname(nick)
    if (nicknameError) {
      wx.showToast({ title: nicknameError, icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    registerUser({
      username: u,
      password,
      email: em,
      nickname: nick
    })
      .then(() => {
        wx.showToast({ title: '注册成功', icon: 'success' })
        setTimeout(() => {
          wx.redirectTo({
            url: `/pages/login/login?username=${encodeURIComponent(u)}`
          })
        }, 600)
      })
      .catch((err) => {
        wx.showToast({
          title: err.message || '注册失败',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ submitting: false })
      })
  }
})
