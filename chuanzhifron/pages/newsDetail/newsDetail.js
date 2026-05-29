const { loadNewsDetail } = require('../../services/content.service.js')

Page({
  data: {
    newsId: '',
    newsDetail: {},
    imageList: [],
    contentParagraphs: [],
    loadFailed: false,
    loadErrorText: ''
  },

  onLoad(options) {
    const newsId = options.id
    if (!newsId) {
      wx.showToast({ title: '缺少新闻ID', icon: 'none' })
      this.setData({ loadFailed: true, loadErrorText: '缺少新闻 ID' })
      return
    }
    this.setData({ newsId })
    this.loadNewsDetail(newsId)
  },

  loadNewsDetail(id) {
    this.setData({ loadFailed: false, loadErrorText: '' })
    loadNewsDetail(id)
      .then((payload) => {
        this.setData({
          newsDetail: payload.newsDetail,
          imageList: payload.imageList,
          contentParagraphs: payload.contentParagraphs,
          loadFailed: false
        })
      })
      .catch((err) => {
        const msg = err.message || '获取新闻详情失败'
        const displayError = /不存在|not found/i.test(msg) ? '该新闻不存在或已下线' : msg
        this.setData({
          loadFailed: true,
          loadErrorText: displayError,
          newsDetail: {},
          imageList: [],
          contentParagraphs: []
        })
        wx.showToast({
          title: displayError,
          icon: 'none',
          duration: 2000
        })
      })
  },

  onRetryLoad() {
    if (this.data.newsId) {
      this.loadNewsDetail(this.data.newsId)
    }
  }
})
