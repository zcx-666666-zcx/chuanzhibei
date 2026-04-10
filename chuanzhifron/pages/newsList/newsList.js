// pages/newsList/newsList.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { normalizeNewsResponseData, mapNewsItem } = require('../../utils/newsDisplay.js')

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
    const { keyword, hasMore, loading, loadingMore } = this.data
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

  buildListUrl(page, keyword) {
    if (keyword) {
      return `/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${PAGE_SIZE}`
    }
    return `/news/recent?page=${page}&size=${PAGE_SIZE}`
  },

  loadNewsData({ reset }) {
    const { keyword, page, newsList } = this.data
    const nextPage = reset ? 0 : page

    if (reset) {
      this.setData({ loading: true, page: 0, loadError: false, loadErrorText: '' })
    } else {
      this.setData({ loadingMore: true })
    }

    return request({
      url: this.buildListUrl(nextPage, keyword)
    })
      .then((res) => {
        if (!res.success) {
          throw new Error(res.message || '获取新闻失败')
        }

        const { list: rawList, total, page: serverPage, hasMore } = normalizeNewsResponseData(res.data)
        const mapped = rawList.map(mapNewsItem)
        const merged = reset ? mapped : newsList.concat(mapped)

        this.setData({
          newsList: merged,
          loading: false,
          loadingMore: false,
          loadError: false,
          loadErrorText: '',
          page: (serverPage != null ? serverPage : nextPage) + 1,
          total: typeof total === 'number' ? total : merged.length,
          hasMore: Boolean(hasMore)
        })
      })
      .catch((err) => {
        console.error('获取新闻失败:', err)
        const msg = requestErrorMessage(err)
        this.setData({
          loading: false,
          loadingMore: false,
          loadError: reset,
          loadErrorText: reset ? msg : this.data.loadErrorText
        })
        wx.showToast({
          title: msg,
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
