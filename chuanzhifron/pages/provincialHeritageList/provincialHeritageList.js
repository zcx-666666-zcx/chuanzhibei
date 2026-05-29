const { requireLogin } = require('../../utils/guard.js')
const { addMyCollection, removeMyCollection } = require('../../services/profile.service.js')
const { loadHeritageCatalog, resolveHeritageLevelText } = require('../../services/content.service.js')

Page({
  data: {
    currentCategory: 'all',
    heritageList: [],
    loading: true
  },

  onLoad(options) {
    const category = options.category || 'all'
    this.setData({
      currentCategory: category
    })
    this.loadHeritageData()
  },

  loadHeritageData() {
    this.setData({ loading: true })
    return loadHeritageCatalog({
      level: 2,
      category: this.data.currentCategory,
      includeFavorite: true
    }).then((heritageList) => {
      this.setData({
        heritageList,
        loading: false
      })
    }).catch((err) => {
      this.setData({
        heritageList: [],
        loading: false
      })
      wx.showToast({
        title: err.message || '加载数据失败',
        icon: 'none'
      })
    })
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category
    })
    this.loadHeritageData()
  },

  onHeritageTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    })
  },

  toggleFavorite(e) {
    const item = e.currentTarget.dataset.item
    if (!requireLogin({ content: '请先登录后再收藏非遗项目' })) {
      return
    }

    const heritageId = item.id
    const isFavorite = Boolean(item.isFavorite)

    this.patchFavorite(heritageId, !isFavorite)

    const action = isFavorite
      ? removeMyCollection(heritageId)
      : addMyCollection({
        heritageId,
        heritageName: item.name,
        heritageDescription: item.description || '',
        heritageLevel: resolveHeritageLevelText(item.level),
        imageUrl: item.imageUrl || item.image || ''
      })

    action.then(() => {
      wx.showToast({
        title: isFavorite ? '已取消收藏' : '收藏成功',
        icon: 'success'
      })
    }).catch((err) => {
      this.patchFavorite(heritageId, isFavorite)
      wx.showToast({
        title: err.message || (isFavorite ? '取消收藏失败' : '收藏失败'),
        icon: 'none'
      })
    })
  },

  patchFavorite(heritageId, isFavorite) {
    this.setData({
      heritageList: this.data.heritageList.map((heritage) =>
        heritage.id === heritageId ? { ...heritage, isFavorite } : heritage
      )
    })
  }
})
