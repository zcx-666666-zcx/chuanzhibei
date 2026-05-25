const { requireLogin } = require('../../utils/guard.js')
const { joinActivity, listActivities } = require('../../services/experience.service.js')

Page({
  data: {
    activities: [],
    loading: true,
    loadError: false,
    loadErrorText: ''
  },

  onLoad() {
    this.loadActivities()
  },

  loadActivities() {
    this.setData({ loading: true, loadError: false, loadErrorText: '' })
    return listActivities().then((activities) => {
      this.setData({
        activities,
        loading: false,
        loadError: false,
        loadErrorText: ''
      })
    }).catch((err) => {
      const msg = err.message || '获取活动列表失败'
      this.setData({
        activities: [],
        loading: false,
        loadError: true,
        loadErrorText: msg
      })
      wx.showToast({
        title: msg,
        icon: 'none'
      })
    })
  },

  onRetryLoadActivities() {
    this.loadActivities()
  },

  joinActivity(e) {
    const item = e.currentTarget.dataset.item
    if (!requireLogin({ content: '请先登录后再报名活动' })) {
      return
    }
    if (item.buttonText === '已满员') {
      wx.showToast({
        title: '活动已满员',
        icon: 'none'
      })
      return
    }

    wx.showModal({
      title: '参加活动',
      content: `确定要${item.buttonText || '参加'}「${item.title}」吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (!res.confirm) return
        joinActivity(item)
          .then(() => {
            wx.showToast({
              title: item.buttonText === '报名参加' ? '报名成功' : '预约成功',
              icon: 'success'
            })
            this.loadActivities()
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || '参加活动失败',
              icon: 'none'
            })
          })
      }
    })
  }
})
