// app.js
const { buildStaticUrl } = require('./utils/config.js')

App({
  /**
   * 小程序初始化完成时触发
   */
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 本地数据模式：在未接入真实后端时，使用 utils/mockApi 拦截 request
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
    /** 设为 false 可切换为「真实后端 + 登录页」流程 */
    localDataMode: true,
    userInfo: null
  }
})
