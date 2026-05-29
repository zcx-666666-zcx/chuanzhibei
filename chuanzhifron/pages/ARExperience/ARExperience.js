const { getVideoPreloadMode } = require('../../utils/resourceProfile.js')
const {
  AR_PLACEHOLDER_IMAGE,
  listArHistory,
  listArProjects
} = require('../../services/experience.service.js')

Page({
  data: {
    arProjects: [],
    experienceRecords: [],
    loading: true,
    videoPreload: 'metadata',
    arPlaceholderImage: AR_PLACEHOLDER_IMAGE
  },

  onLoad() {
    this.initResourceProfile()
    this.loadArProjects().finally(() => {
      this.loadHistory()
    })
    this.checkARSupport()
  },

  initResourceProfile() {
    wx.getNetworkType({
      success: ({ networkType }) => {
        this.setData({ videoPreload: getVideoPreloadMode(networkType) });
      },
      fail: () => {
        this.setData({ videoPreload: 'metadata' });
      }
    });
  },
  
  loadArProjects() {
    return listArProjects().then((processedList) => {
      this.setData({
        arProjects: processedList,
        loading: false
      })
    }).catch((err) => {
      this.setData({
        loading: false
      })
      wx.showToast({
        title: err.message || '加载沉浸项目失败',
        icon: 'none'
      })
    })
  },

  loadHistory() {
    return listArHistory(this.data.arProjects).then((experienceRecords) => {
      this.setData({ experienceRecords })
    })
  },

  goARProjectListFull() {
    wx.navigateTo({ url: '/pages/ARProjectList/ARProjectList' })
  },

  onArProjectTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item) return
    wx.navigateTo({
      url: `/pages/xrDemo3D/xrDemo3D?title=${encodeURIComponent(item.name || '3D沉浸演示')}`
    })
  },

  checkARSupport() {
    wx.getSystemInfo({
      success: (res) => {
        console.log('设备信息:', res)
      }
    })
  },

  onRecordPreviewMetaLoaded(e) {
    const index = e.currentTarget.dataset.index;
    const duration = Number(e.detail && e.detail.duration) || 0;
    if (index === undefined || !duration) return;

    const ctx = wx.createVideoContext(`record-preview-video-${index}`, this);
    const seekTo = Math.max(duration - 0.1, 0);
    ctx.play();
    setTimeout(() => {
      ctx.seek(seekTo);
      setTimeout(() => {
        ctx.pause();
      }, 120);
    }, 80);
  },

  replayExperience(e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: '重新查看',
      content: `确定要重新体验"${item.name}"吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/xrDemo3D/xrDemo3D?title=${encodeURIComponent(item.name || '3D沉浸演示')}`
          })
        }
      }
    })
  },

  onPullDownRefresh() {
    this.loadArProjects()
      .then(() => this.loadHistory())
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  }
})
