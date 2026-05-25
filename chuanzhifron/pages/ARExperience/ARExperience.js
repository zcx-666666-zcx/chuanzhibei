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
        title: err.message || '加载AR项目失败',
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
    if (!item || item.id == null) return
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera'] === false) {
          wx.showModal({
            title: '需要相机权限',
            content: 'AR体验需要访问您的相机，请在设置中开启相机权限',
            showCancel: false,
            confirmText: '知道了'
          })
          return
        }
        wx.navigateTo({
          url: `/pages/ARPlay/ARPlay?id=${item.id}&videoUrl=${encodeURIComponent(item.videoUrl || '')}`
        })
      }
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
      title: '重新体验',
      content: `确定要重新体验"${item.name}"吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          wx.getSetting({
            success: (res) => {
              if (res.authSetting['scope.camera'] === false) {
                wx.showModal({
                  title: '需要相机权限',
                  content: 'AR体验需要访问您的相机，请在设置中开启相机权限',
                  showCancel: false,
                  confirmText: '知道了'
                })
                return
              }
              wx.navigateTo({
                url: `/pages/ARPlay/ARPlay?id=${item.projectId}&videoUrl=${encodeURIComponent(item.videoUrl || '')}`
              })
            }
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
