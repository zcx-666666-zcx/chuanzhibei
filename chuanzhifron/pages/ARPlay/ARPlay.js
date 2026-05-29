const { getVideoPreloadMode } = require('../../utils/resourceProfile.js')
const {
  AR_PLACEHOLDER_IMAGE,
  getArProjectDetail,
  saveArHistory
} = require('../../services/experience.service.js')

Page({
  data: {
    project: {},
    instructionLines: [],
    arRecognitionActive: false,
    loading: true,
    loadFailed: false,
    loadErrorText: '',
    videoPreload: 'metadata',
    arPlaceholderImage: AR_PLACEHOLDER_IMAGE,
    projectLoadId: ''
  },

  onLoad(options) {
    this.initResourceProfile()
    const id = options.id
    this.overrideVideoUrl = decodeURIComponent(options.videoUrl || '')
    if (!id) {
      wx.showToast({
        title: '缺少项目ID',
        icon: 'none'
      })
      this.setData({
        loading: false,
        loadFailed: true,
        loadErrorText: '缺少项目 ID',
        projectLoadId: ''
      })
      return
    }
    this.setData({ projectLoadId: id })
    this.loadProject(id)
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

  onRetryLoadProject() {
    const id = this.data.projectLoadId
    if (id) {
      this.loadProject(id)
    }
  },

  loadProject(id) {
    this.setData({ loading: true, loadFailed: false, loadErrorText: '' })
    return getArProjectDetail(id, this.overrideVideoUrl).then(({ project, instructionLines }) => {
      this.setData({
        project,
        instructionLines,
        loading: false,
        loadFailed: false,
        loadErrorText: ''
      })
    }).catch((err) => {
      this.setData({
        loading: false,
        loadFailed: true,
        loadErrorText: err.message || '获取沉浸项目失败'
      })
    })
  },

  onPlayPreviewMetaLoaded(e) {
    const duration = Number(e.detail && e.detail.duration) || 0;
    if (!duration) return;
    const ctx = wx.createVideoContext('ar-play-preview-video', this);
    const seekTo = Math.max(duration - 0.1, 0);
    ctx.play();
    setTimeout(() => {
      ctx.seek(seekTo);
      setTimeout(() => {
        ctx.pause();
      }, 120);
    }, 80);
  },

  startCamera() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera'] === false) {
          wx.showModal({
            title: '需要相机权限',
            content: '请在设置中开启相机权限以继续 AR 体验',
            showCancel: true,
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    if (settingRes.authSetting['scope.camera']) {
                      this.initiateRecognition()
                    }
                  }
                })
              }
            }
          })
        } else {
          this.initiateRecognition()
        }
      }
    })
  },

  initiateRecognition() {
    wx.showToast({
      title: '请对准识别图开始体验',
      icon: 'none',
      duration: 2000
    })

    setTimeout(() => {
      this.setData({
        arRecognitionActive: true
      })

      wx.showToast({
        title: '识别成功！',
        icon: 'success',
        duration: 1000
      })

      this.experienceStartTime = Date.now()
    }, 2000)
  },

  onUnload() {
    if (this.experienceStartTime && this.data.project.id) {
      const duration = Math.round((Date.now() - this.experienceStartTime) / 1000)
      saveArHistory(this.data.project.id, duration).then((saved) => {
        if (saved) {
          console.log('体验记录保存成功')
        }
      })
    }
  }
})
