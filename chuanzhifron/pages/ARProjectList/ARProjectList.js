const { getVideoPreloadMode } = require('../../utils/resourceProfile.js')
const { AR_PLACEHOLDER_IMAGE, listArProjects } = require('../../services/experience.service.js')

Page({
  data: {
    arProjects: [],
    loading: true,
    videoPreload: 'metadata',
    arPlaceholderImage: AR_PLACEHOLDER_IMAGE
  },

  onLoad() {
    this.initResourceProfile()
    this.loadArProjects()
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
    this.setData({ loading: true })
    return listArProjects().then((arProjects) => {
      this.setData({
        arProjects,
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
      throw err
    })
  },

  onARProjectTap(e) {
    const item = e.currentTarget.dataset.item
    this.startARExperience(item)
  },

  startARExperience(e) {
    const item = e && e.currentTarget ? e.currentTarget.dataset.item : e
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

  onProjectPreviewMetaLoaded(e) {
    const index = e.currentTarget.dataset.index;
    const duration = Number(e.detail && e.detail.duration) || 0;
    if (index === undefined || !duration) return;

    const ctx = wx.createVideoContext(`project-preview-video-${index}`, this);
    const seekTo = Math.max(duration - 0.1, 0);
    ctx.play();
    setTimeout(() => {
      ctx.seek(seekTo);
      setTimeout(() => {
        ctx.pause();
      }, 120);
    }, 80);
  },

  onPullDownRefresh() {
    this.loadArProjects().finally(() => {
      wx.stopPullDownRefresh()
    })
  }
})
