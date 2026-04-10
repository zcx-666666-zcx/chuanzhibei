// app.js
const { buildStaticUrl } = require('./utils/config.js')
const { useMockApi } = require('./utils/env.js')

App({
  /**
   * 小程序初始化完成时触发
   */
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // mock 模式：见 utils/env.js（生产环境强制关闭）
    if (this.globalData.localDataMode) {
      wx.setStorageSync('token', 'local-session-token')
      wx.setStorageSync('userInfo', {
        id: 1,
        userId: 1,
        nickname: '云窗客',
        nickName: '云窗客',
        username: 'yun_chuang_ke',
        avatarUrl: buildStaticUrl('/uploads/login-bg.png.png'),
        signature: '遗韵随行，技艺入心'
      })
      return
    }

    const token = wx.getStorageSync('token')
    if (!token) {
      wx.redirectTo({
        url: '/pages/login/login'
      })
    }
  },

  /**
   * 全局数据
   */
  globalData: {
    /** 与 utils/env.js 中 useMockApi() 一致；生产环境为 false */
    localDataMode: useMockApi(),
    userInfo: null
  }
})
