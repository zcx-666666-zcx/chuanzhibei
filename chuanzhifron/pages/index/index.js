const { DEFAULT_IMAGE_DATA_URI, buildStaticUrl } = require('../../utils/config.js')
const { requestErrorMessage } = require('../../utils/util.js')
const { isLoggedIn } = require('../../utils/auth.js')
const { createPageState, patchPageState } = require('../../utils/page-state.js')
const { loadHomePayload } = require('../../services/home.service.js')

Page({
  data: {
    motto: '非遗传承 - 智慧生活',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newsList: [],
    displayNewsList: [],
    bannerList: [],
    recommendList: [],
    notifications: [],
    logoUrl: buildStaticUrl('/uploads/login-bg.png.png'),
    fallbackImage: DEFAULT_IMAGE_DATA_URI,
    newsLoading: true,
    newsLoadError: false,
    pageState: createPageState({ loading: true })
  },

  onLoad() {
    this.syncGlobalUser()
    this.loadPageData()
  },

  onShow() {
    this.syncGlobalUser()
  },

  onPullDownRefresh() {
    patchPageState(this, { refreshing: true, error: '' })
    this.loadPageData()
      .finally(() => {
        patchPageState(this, { refreshing: false })
        wx.stopPullDownRefresh()
      })
  },

  syncGlobalUser() {
    try {
      const app = getApp()
      const user = app && app.globalData ? app.globalData.userInfo : null
      this.setData({
        userInfo: user || {},
        hasUserInfo: !!user
      })
    } catch (_e) {
      this.setData({
        userInfo: {},
        hasUserInfo: false
      })
    }
  },

  loadPageData() {
    this.setData({
      newsLoading: true,
      newsLoadError: false
    })
    patchPageState(this, { loading: true, error: '' })
    return loadHomePayload()
      .then((payload) => {
        const homeNewsSize = Number(payload.clientConfig?.homeNewsSize || 5)
        const homeRecommendSize = Number(payload.clientConfig?.homeRecommendSize || 4)
        this.setData({
          bannerList: payload.bannerList || [],
          newsList: payload.newsList || [],
          displayNewsList: (payload.newsList || []).slice(0, homeNewsSize),
          recommendList: (payload.recommendList || []).slice(0, homeRecommendSize),
          notifications: payload.notifications || [],
          newsLoading: false,
          newsLoadError: false
        })
        patchPageState(this, {
          loading: false,
          empty: (payload.newsList || []).length === 0 && (payload.recommendList || []).length === 0
        })
      })
      .catch((err) => {
        const message = err.message || requestErrorMessage(err)
        this.setData({
          bannerList: [],
          newsList: [],
          displayNewsList: [],
          recommendList: [],
          notifications: [],
          newsLoading: false,
          newsLoadError: true
        })
        patchPageState(this, {
          loading: false,
          empty: true,
          error: message
        })
        wx.showToast({
          title: message,
          icon: 'none'
        })
      })
  },

  onLogoError() {
    this.setData({ logoUrl: this.data.fallbackImage })
  },

  onBannerImageError(e) {
    const index = e.currentTarget.dataset.index
    if (index === undefined) return
    this.setData({
      [`bannerList[${index}].image`]: this.data.fallbackImage
    })
  },

  onNewsImageError(e) {
    const index = e.currentTarget.dataset.index
    if (index === undefined) return
    this.setData({
      [`displayNewsList[${index}].image`]: this.data.fallbackImage
    })
  },

  onRecommendImageError(e) {
    const index = e.currentTarget.dataset.index
    if (index === undefined) return
    this.setData({
      [`recommendList[${index}].image`]: this.data.fallbackImage
    })
  },

  getUserInfo(e) {
    const userInfo = e.detail.userInfo || {}
    this.setData({
      userInfo,
      hasUserInfo: !!userInfo.nickName
    })
  },

  onSearch() {
    wx.showModal({
      title: '搜索新闻',
      editable: true,
      placeholderText: '输入关键词，例如：剪纸',
      success: (res) => {
        if (!res.confirm) {
          return
        }
        const keyword = (res.content || '').trim()
        wx.navigateTo({
          url: `/pages/newsList/newsList?keyword=${encodeURIComponent(keyword)}`
        })
      }
    })
  },

  onNotification() {
    const notifications = this.data.notifications || []
    if (!notifications.length) {
      wx.showToast({ title: '暂无新通知', icon: 'none' })
      return
    }
    const latest = notifications[0]
    wx.showModal({
      title: latest.title || '系统通知',
      content: latest.content || '暂无内容',
      showCancel: false
    })
  },

  onNewsTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${item.id}`
    })
  },

  onRecommendTap(e) {
    const item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    })
  },

  onBannerTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item) {
      return
    }
    if (item.newsId) {
      wx.navigateTo({
        url: `/pages/newsDetail/newsDetail?id=${item.newsId}`
      })
      return
    }

    const matchedNews = (this.data.newsList || []).find((news) => news.title === item.title)
    if (matchedNews && matchedNews.id) {
      wx.navigateTo({
        url: `/pages/newsDetail/newsDetail?id=${matchedNews.id}`
      })
      return
    }

    wx.navigateTo({
      url: `/pages/newsList/newsList?keyword=${encodeURIComponent(item.title || '')}`
    })
  },

  navigateToARExperience() {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  },

  goFlowNews() {
    wx.navigateTo({
      url: '/pages/newsList/newsList'
    })
  },

  goFlowHeritage() {
    wx.navigateTo({
      url: '/pages/Heritage/Heritage'
    })
  },

  goFlowDetailDirect() {
    const first = (this.data.recommendList || [])[0]
    if (!first || !first.id) {
      wx.showToast({
        title: '暂无可用的推荐项目',
        icon: 'none'
      })
      return
    }
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${first.id}`
    })
  },

  goFlowAR() {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  },

  goActivity() {
    wx.navigateTo({
      url: '/pages/activityList/activityList'
    })
  },

  goNewsList() {
    wx.navigateTo({ url: '/pages/newsList/newsList' })
  },

  goNewsDetailDemo() {
    wx.navigateTo({ url: '/pages/newsDetail/newsDetail?id=1' })
  },

  goNational() {
    wx.navigateTo({
      url: '/pages/nationalHeritageList/nationalHeritageList?category=all'
    })
  },

  goProvincial() {
    wx.navigateTo({
      url: '/pages/provincialHeritageList/provincialHeritageList?category=all'
    })
  },

  goCollection() {
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看我的收藏',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }
    wx.navigateTo({ url: '/pages/collectionList/collectionList' })
  },

  goBooking() {
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看我的预约',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }
    wx.navigateTo({ url: '/pages/bookingList/bookingList' })
  },

  goSkillVideo() {
    wx.navigateTo({ url: '/pages/skillVideoList/skillVideoList' })
  },

  goMasterList() {
    wx.navigateTo({ url: '/pages/masterList/masterList' })
  },

  goPersonal() {
    wx.switchTab({ url: '/pages/PersonalCenter/PersonalCenter' })
  }
})
