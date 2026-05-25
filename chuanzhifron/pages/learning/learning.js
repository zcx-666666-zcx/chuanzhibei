// pages/learning/learning.js
const { isLoggedIn } = require('../../utils/auth.js')
const {
  getFallbackLearningChapters,
  loadLearningPath,
  loadLearningProgress,
  updateLearningProgress
} = require('../../services/content.service.js')

Page({
  data: {
    loading: true,
    loadError: false,
    loadErrorText: '',
    chapters: [],
    progressPercent: 0,
    completedCount: 0,
    totalChapters: 0,
    completedChapterIds: []
  },

  onLoad() {
    this.loadLearningData()
  },

  onShow() {
    if (this.data.chapters.length > 0) {
      this.loadProgress().catch(() => {})
    }
  },

  loadLearningData() {
    this.setData({ loading: true, loadError: false, loadErrorText: '' })
    return loadLearningPath().then((chapters) => {
      this.setData({
        chapters,
        totalChapters: chapters.length,
        loading: false,
        loadError: false,
        loadErrorText: ''
      })
      return this.loadProgress().catch(() => {})
    }).catch((err) => {
      const fallbackChapters = getFallbackLearningChapters()
      const msg = err.message || '获取学习路径失败'
      this.setData({
        loading: false,
        loadError: true,
        loadErrorText: msg,
        chapters: fallbackChapters,
        totalChapters: fallbackChapters.length
      })
      wx.showToast({ title: msg, icon: 'none' })
      return this.loadProgress().catch(() => {})
    })
  },

  loadProgress() {
    if (!isLoggedIn()) {
      this.setData({
        progressPercent: 0,
        completedCount: 0,
        completedChapterIds: []
      })
      return Promise.resolve()
    }
    return loadLearningProgress().then((data) => {
      this.setData({
        progressPercent: data.progressPercent,
        completedCount: data.completedCount,
        totalChapters: Number(data.totalChapters || this.data.totalChapters || 0),
        completedChapterIds: data.completedChapterIds
      })
    }).catch((err) => {
      const msg = err.message || '获取学习进度失败'
      if (!/登录已失效/.test(msg)) {
        wx.showToast({ title: msg, icon: 'none' })
      }
    })
  },

  onChapterTap(e) {
    const item = e.currentTarget.dataset.item
    if (item && item.path) {
      wx.navigateTo({ url: item.path })
    }
  },

  markChapterDone(e) {
    const chapterId = e.currentTarget.dataset.chapterId
    if (!chapterId) {
      return
    }
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '登录后可同步学习进度，是否前往登录？',
        showCancel: true,
        cancelText: '稍后',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }
    const completed = !this.data.completedChapterIds.includes(chapterId)
    updateLearningProgress({
        chapterId,
        completed
      }).then(() => {
      return this.loadProgress()
    }).then(() => {
      wx.showToast({
        title: completed ? '已标记完成' : '已取消完成',
        icon: 'success'
      })
    }).catch((err) => {
      wx.showToast({
        title: err.message || '更新学习进度失败',
        icon: 'none'
      })
    })
  },

  goHeritage() {
    wx.navigateTo({
      url: '/pages/Heritage/Heritage'
    })
  },

  goNewsList() {
    wx.navigateTo({
      url: '/pages/newsList/newsList'
    })
  },

  goSkillVideo() {
    wx.navigateTo({
      url: '/pages/skillVideoList/skillVideoList'
    })
  },

  goActivityList() {
    wx.navigateTo({
      url: '/pages/activityList/activityList'
    })
  },

  onRetryLoad() {
    this.loadLearningData()
  },

  onPullDownRefresh() {
    this.loadLearningData().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
