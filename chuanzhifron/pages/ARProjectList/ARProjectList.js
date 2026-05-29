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
        title: err.message || '加载沉浸项目失败',
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
    wx.navigateTo({
      url: `/pages/xrDemo3D/xrDemo3D?title=${encodeURIComponent(item.name || '3D沉浸演示')}`
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
