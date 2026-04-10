// pages/newsDetail/newsDetail.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { buildStaticUrl } = require('../../utils/config.js')

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
    request({
      url: `/news/${id}`
    })
      .then((response) => {
        if (!response.success) {
          throw new Error(response.message || '获取新闻详情失败')
        }
        const data = response.data
        if (!data) {
          throw new Error('未获取到新闻数据')
        }

        let imageList = []
        if (data.imageUrls) {
          imageList = data.imageUrls.split(',').map((url) => {
            const trimmedUrl = url.trim()
            if (trimmedUrl.startsWith('http')) {
              return trimmedUrl
            }
            return buildStaticUrl(trimmedUrl)
          })
        } else {
          imageList = [buildStaticUrl(`/uploads/news_index/news_${id}.jpg`)]
        }

        let contentParagraphs = []
        if (data.content) {
          contentParagraphs = data.content.split('\n').filter((p) => p.trim() !== '')
        }

        let publishTime = data.publishTime
        if (publishTime) {
          if (typeof publishTime === 'object' && publishTime.year) {
            publishTime = `${publishTime.year}-${String(publishTime.monthValue).padStart(2, '0')}-${String(publishTime.dayOfMonth).padStart(2, '0')} ${String(publishTime.hour).padStart(2, '0')}:${String(publishTime.minute).padStart(2, '0')}:${String(publishTime.second).padStart(2, '0')}`
          } else if (typeof publishTime === 'object' && Object.prototype.hasOwnProperty.call(publishTime, 'time')) {
            const date = new Date(publishTime.time)
            publishTime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
          }
        } else {
          publishTime = '—'
        }

        const author = data.author || '非遗文化编辑部'
        const newsDetail = {
          ...data,
          publishTime,
          author
        }

        this.setData({
          newsDetail,
          imageList,
          contentParagraphs,
          loadFailed: false
        })
      })
      .catch((err) => {
        console.error('获取新闻详情失败:', err)
        const msg = requestErrorMessage(err)
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
    const id = this.data.newsId
    if (id) {
      this.loadNewsDetail(id)
    }
  }
})
