// pages/learning/learning.js
const { request, requestErrorMessage } = require('../../utils/util.js')
const { isLoggedIn } = require('../../utils/auth.js')

const FALLBACK_CHAPTERS = [
  {
    id: 'chapter-1',
    title: '非遗入门导览',
    duration: '15分钟',
    type: 'guide',
    description: '先了解非遗定义、门类与保护体系。',
    path: '/pages/newsList/newsList',
    isFallback: true
  },
  {
    id: 'chapter-2',
    title: '名录与地域认知',
    duration: '20分钟',
    type: 'heritage',
    description: '通过名录认识地域差异与代表性项目。',
    path: '/pages/Heritage/Heritage',
    isFallback: true
  },
  {
    id: 'chapter-3',
    title: '技艺案例学习',
    duration: '25分钟',
    type: 'video',
    description: '观看技艺演示视频，理解工艺流程。',
    path: '/pages/skillVideoList/skillVideoList',
    isFallback: true
  },
  {
    id: 'chapter-4',
    title: '活动实践体验',
    duration: '20分钟',
    type: 'activity',
    description: '报名活动并进行线下互动体验。',
    path: '/pages/activityList/activityList',
    isFallback: true
  }
]

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
    return request({
      url: '/learning/path'
    }).then((res) => {
      if (!res.success) {
        throw new Error(res.message || '获取学习路径失败')
      }
      const chapters = Array.isArray(res.data) ? res.data : []
      this.setData({
        chapters: chapters.length > 0 ? chapters : FALLBACK_CHAPTERS.slice(),
        totalChapters: chapters.length > 0 ? chapters.length : FALLBACK_CHAPTERS.length,
        loading: false,
        loadError: false,
        loadErrorText: ''
      })
      return this.loadProgress().catch(() => {})
    }).catch((err) => {
      const msg = requestErrorMessage(err)
      this.setData({
        loading: false,
        loadError: true,
        loadErrorText: msg,
        chapters: FALLBACK_CHAPTERS.slice(),
        totalChapters: FALLBACK_CHAPTERS.length
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
    return request({
      url: '/learning/progress'
    }).then((res) => {
      if (!res.success || !res.data) {
        throw new Error(res.message || '获取学习进度失败')
      }
      const data = res.data
      this.setData({
        progressPercent: Number(data.progressPercent || 0),
        completedCount: Number(data.completedCount || 0),
        totalChapters: Number(data.totalChapters || this.data.totalChapters || 0),
        completedChapterIds: Array.isArray(data.completedChapterIds) ? data.completedChapterIds : []
      })
    }).catch((err) => {
      const msg = requestErrorMessage(err)
      if (err.statusCode !== 401) {
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
    request({
      url: '/learning/progress',
      method: 'POST',
      data: {
        chapterId,
        completed
      }
    }).then((res) => {
      if (!res.success) {
        throw new Error(res.message || '更新学习进度失败')
      }
      return this.loadProgress()
    }).then(() => {
      wx.showToast({
        title: completed ? '已标记完成' : '已取消完成',
        icon: 'success'
      })
    }).catch((err) => {
      wx.showToast({
        title: requestErrorMessage(err),
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
