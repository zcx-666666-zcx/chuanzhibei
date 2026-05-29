const { getDefaultSkillVideos, loadSkillVideos } = require('../../services/content.service.js')

Page({
  data: {
    skillVideos: [],
    loading: true,
    playingVideo: null,
    showVideoPlayer: false
  },

  onLoad() {
    this.loadSkillVideos()
  },

  loadSkillVideos() {
    this.setData({ loading: true })
    return loadSkillVideos()
      .then((skillVideos) => {
        if (skillVideos.length === 0) {
          this.setData({
            skillVideos: getDefaultSkillVideos().map((item) => ({ ...item, isFallback: true })),
            loading: false
          })
          return
        }
        this.setData({
          skillVideos,
          loading: false
        })
      })
      .catch((err) => {
        this.setData({
          skillVideos: getDefaultSkillVideos().map((item) => ({ ...item, isFallback: true })),
          loading: false
        })
        wx.showToast({
          title: err.message || '获取视频失败',
          icon: 'none'
        })
      })
  },

  onVideoTap(e) {
    const item = e.currentTarget.dataset.item
    if (!item.videoUrl) {
      wx.showToast({
        title: '当前视频暂不可播放',
        icon: 'none'
      })
      return
    }
    this.setData({
      playingVideo: item,
      showVideoPlayer: true
    })
  },

  closeVideoPlayer() {
    this.setData({
      showVideoPlayer: false,
      playingVideo: null
    })
  }
})
