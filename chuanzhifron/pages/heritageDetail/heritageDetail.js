const { isLoggedIn } = require('../../utils/auth.js')
const { requireLogin } = require('../../utils/guard.js')
const { buildStaticUrl } = require('../../utils/config.js')
const {
  loadCollectionFallbackDetail,
  loadHeritageDetail,
  resolveHeritageLevelText
} = require('../../services/content.service.js')
const {
  addMyCollection,
  checkMyCollection,
  removeMyCollection
} = require('../../services/profile.service.js')

Page({
  data: {
    heritageDetail: {},
    imageUrl: '',
    descriptionParagraphs: [],
    levelText: '',
    categoryText: '',
    isFavorite: false,
    heritageId: null,
    fromCollection: false,
    collectionData: null,
    loading: true,
    loadFailed: false,
    loadErrorText: '',
    defaultImageUrl: buildStaticUrl('/uploads/photo_ARExperience.png')
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      wx.showToast({
        title: '未找到项目ID',
        icon: 'none'
      })
      this.setData({ loading: false, loadFailed: true, loadErrorText: '缺少项目 ID' })
      return
    }

    this._heritageLoadId = id
    const fromCollection = options.fromCollection === 'true'
    let collectionData = null
    if (fromCollection) {
      try {
        collectionData = wx.getStorageSync('tempCollectionData')
        if (collectionData) {
          wx.removeStorageSync('tempCollectionData')
        }
      } catch (_e) {
        collectionData = null
      }
    }

    this.setData({
      fromCollection,
      collectionData
    })

    this.loadHeritageDetail(id)
  },

  onRetryLoad() {
    const id = this._heritageLoadId || this.data.heritageId
    if (id) {
      this.loadHeritageDetail(id)
    }
  },

  onFailBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) })
  },

  loadHeritageDetail(id) {
    this.setData({ loading: true, loadFailed: false, loadErrorText: '' })
    const heritageId = parseInt(id, 10)
    if (!heritageId || Number.isNaN(heritageId)) {
      this.setData({ loading: false, loadFailed: true, loadErrorText: '非遗项目 ID 无效' })
      wx.showModal({
        title: '错误',
        content: '非遗项目ID无效',
        showCancel: false,
        confirmText: '确定',
        success: () => {
          wx.navigateBack()
        }
      })
      return
    }

    loadHeritageDetail(heritageId)
      .then((payload) => {
        this.setData({
          heritageDetail: payload.heritageDetail,
          imageUrl: payload.imageUrl,
          descriptionParagraphs: payload.descriptionParagraphs,
          levelText: payload.levelText,
          categoryText: payload.categoryText,
          heritageId: payload.heritageDetail.id,
          loading: false,
          loadFailed: false,
          loadErrorText: ''
        })
        this.refreshFavoriteStatus(payload.heritageDetail.id)
      })
      .catch((err) => {
        const errorMsg = err.message || '加载详情失败'
        if (this.data.fromCollection && this.data.collectionData && errorMsg.includes('不存在')) {
          const fallback = loadCollectionFallbackDetail(this.data.collectionData)
          this.setData({
            heritageDetail: fallback.heritageDetail,
            imageUrl: fallback.imageUrl,
            descriptionParagraphs: fallback.descriptionParagraphs,
            levelText: fallback.levelText,
            categoryText: fallback.categoryText,
            isFavorite: true,
            loading: false,
            loadFailed: false
          })
          wx.showToast({
            title: '提示：该项目可能已不存在',
            icon: 'none',
            duration: 2000
          })
          return
        }

        this.setData({
          loading: false,
          loadFailed: true,
          loadErrorText: errorMsg.includes('不存在')
            ? '该非遗项目不存在或已被删除'
            : errorMsg
        })
      })
  },

  refreshFavoriteStatus(heritageId) {
    if (!isLoggedIn()) {
      this.setData({ isFavorite: false })
      return
    }
    checkMyCollection(heritageId)
      .then((favorite) => {
        this.setData({ isFavorite: favorite })
      })
      .catch(() => {
        this.setData({ isFavorite: false })
      })
  },

  onCoverImageError() {
    this.setData({
      imageUrl: this.data.defaultImageUrl
    })
  },

  toggleFavorite() {
    if (!requireLogin({ content: '请先登录后进行收藏操作' })) {
      return
    }

    const { heritageId, heritageDetail, imageUrl, isFavorite } = this.data
    if (!heritageId) {
      wx.showToast({
        title: '项目信息不完整',
        icon: 'none'
      })
      return
    }

    if (isFavorite) {
      removeMyCollection(heritageId)
        .then(() => {
          this.setData({ isFavorite: false })
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          })
        })
        .catch((err) => {
          wx.showToast({
            title: err.message || '取消收藏失败',
            icon: 'none'
          })
        })
      return
    }

    addMyCollection({
      heritageId,
      heritageName: heritageDetail.name,
      heritageDescription: heritageDetail.description || '',
      heritageLevel: resolveHeritageLevelText(heritageDetail.level),
      imageUrl
    }).then(() => {
      this.setData({ isFavorite: true })
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      })
    }).catch((err) => {
      wx.showToast({
        title: err.message || '收藏失败',
        icon: 'none'
      })
    })
  }
})
