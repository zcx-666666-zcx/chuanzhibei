const { requireLogin } = require('../../utils/guard.js')
const { listMyCollections, removeMyCollection } = require('../../services/profile.service.js')

Page({
  data: {
    collections: [],
    loading: true,
    loadError: false,
    loadErrorText: ''
  },

  onLoad() {
    if (!requireLogin({ content: '请先登录后查看我的收藏' })) {
      wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) })
      return
    }
    this.loadCollections()
  },

  loadCollections() {
    this.setData({ loading: true, loadError: false, loadErrorText: '' })
    return listMyCollections()
      .then((collections) => {
        this.setData({
          collections,
          loading: false,
          loadError: false,
          loadErrorText: ''
        })
      })
      .catch((err) => {
        this.setData({
          collections: [],
          loading: false,
          loadError: true,
          loadErrorText: err.message || '收藏列表加载失败'
        })
        wx.showToast({
          title: err.message || '收藏列表加载失败',
          icon: 'none'
        })
      })
  },

  onCollectionTap(e) {
    const item = e.currentTarget.dataset.item
    const heritageId = item.heritageId || item.id
    if (!heritageId) {
      wx.showToast({
        title: '收藏项信息不完整',
        icon: 'none'
      })
      return
    }

    wx.setStorageSync('tempCollectionData', {
      name: item.name,
      description: item.description,
      level: item.level,
      imageUrl: item.imageUrl || item.image,
      heritageId
    })

    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${heritageId}&fromCollection=true`
    })
  },

  removeCollection(e) {
    const item = e.currentTarget.dataset.item
    const heritageName = item.name || '该项目'

    wx.showModal({
      title: '移除收藏',
      content: `确定要移除"${heritageName}"的收藏吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        const heritageId = item.heritageId || item.id
        removeMyCollection(heritageId)
          .then(() => this.loadCollections())
          .then(() => {
            wx.showToast({
              title: '已移除收藏',
              icon: 'success'
            })
          })
          .catch((err) => {
            wx.showToast({
              title: err.message || '移除收藏失败',
              icon: 'none'
            })
          })
      }
    })
  },

  onPullDownRefresh() {
    this.loadCollections().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onRetryLoad() {
    this.loadCollections()
  }
})
