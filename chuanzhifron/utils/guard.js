const { isLoggedIn } = require('./auth.js')

function requireLogin(options) {
  if (isLoggedIn()) {
    return true
  }

  const content = (options && options.content) || '请先登录后继续操作'
  wx.showModal({
    title: '需要登录',
    content,
    showCancel: true,
    cancelText: '取消',
    confirmText: '去登录',
    success: (res) => {
      if (res.confirm) {
        wx.navigateTo({ url: '/pages/login/login' })
      }
    }
  })
  return false
}

module.exports = {
  requireLogin
}
