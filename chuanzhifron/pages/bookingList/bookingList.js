const { requireLogin } = require('../../utils/guard.js')
const { cancelMyBooking, listMyBookings } = require('../../services/profile.service.js')

Page({
  data: {
    bookings: [],
    loading: true,
    loadError: false,
    loadErrorText: ''
  },

  onLoad() {
    if (!requireLogin({ content: '请先登录后查看预约记录' })) {
      wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) })
      return
    }
    this.loadBookings()
  },

  loadBookings() {
    this.setData({ loading: true, loadError: false, loadErrorText: '' })
    return listMyBookings()
      .then((bookings) => {
        this.setData({
          bookings,
          loading: false,
          loadError: false,
          loadErrorText: ''
        })
      })
      .catch((err) => {
        this.setData({
          bookings: [],
          loading: false,
          loadError: true,
          loadErrorText: err.message || '预约列表加载失败'
        })
        wx.showToast({
          title: err.message || '预约列表加载失败',
          icon: 'none'
        })
      })
  },

  cancelBooking(e) {
    const item = e.currentTarget.dataset.item
    const bookingTitle = item.skill ? `${item.masterName} - ${item.skill}` : item.masterName
    wx.showModal({
      title: '取消预约',
      content: `确定要取消"${bookingTitle}"的预约吗？`,
      showCancel: true,
      cancelText: '不取消',
      confirmText: '确定取消',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        cancelMyBooking(item.id)
          .then(() => this.loadBookings())
          .then(() => {
            wx.showToast({
              title: '已取消预约',
              icon: 'success'
            })
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || '取消预约失败',
              icon: 'none'
            })
          })
      }
    })
  },

  viewBookingDetail(e) {
    const item = e.currentTarget.dataset.item
    const title = item.skill ? `${item.masterName} - ${item.skill}` : item.masterName
    wx.showModal({
      title,
      content: `时间：${item.time}\n地点：${item.location}\n联系方式：${item.contact || '待确认'}\n状态：${item.statusText}`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onPullDownRefresh() {
    this.loadBookings().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onRetryLoad() {
    this.loadBookings()
  }
})
