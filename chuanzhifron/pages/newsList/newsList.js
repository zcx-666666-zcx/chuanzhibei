const { loadNewsList } = require('../../services/content.service.js')

const PAGE_SIZE = 10

Page({
  data: {
    newsList: [],
    loading: true,
    loadingMore: false,
    keyword: '',
    page: 0,
    hasMore: false,
    total: 0,
    loadError: false,
    loadErrorText: ''
  },

  onLoad(options) {
    const keyword = (options.keyword || '').trim()
    this.setData({ keyword })
    this.loadNewsData({ reset: true })
  },

  onReachBottom() {
    const { hasMore, loading, loadingMore } = this.data
    if (!hasMore || loading || loadingMore) {
      return
    }
    this.loadNewsData({ reset: false })
  },

  onPullDownRefresh() {
    this.loadNewsData({ reset: true }).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  loadNewsData({ reset }) {
    const { keyword, page, newsList } = this.data
    const nextPage = reset ? 0 : page

    if (reset) {
      this.setData({ loading: true, page: 0, loadError: false, loadErrorText: '' })
    } else {
      this.setData({ loadingMore: true })
    }

    return loadNewsList({
      keyword,
      page: nextPage,
      pageSize: PAGE_SIZE
    }).then((payload) => {
      const merged = reset ? payload.list : newsList.concat(payload.list)
      this.setData({
        newsList: merged,
        loading: false,
        loadingMore: false,
        loadError: false,
        loadErrorText: '',
        page: (payload.page != null ? payload.page : nextPage) + 1,
        total: typeof payload.total === 'number' ? payload.total : merged.length,
        hasMore: Boolean(payload.hasMore)
      })
    }).catch((err) => {
      this.setData({
        loading: false,
        loadingMore: false,
        loadError: reset,
        loadErrorText: reset ? (err.message || '获取新闻失败') : this.data.loadErrorText
      })
      wx.showToast({
        title: err.message || '获取新闻失败',
        icon: 'none'
      })
    })
  },

  onRetryLoad() {
    this.loadNewsData({ reset: true })
  },

  onNewsTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${item.id}`
    })
  }
})
