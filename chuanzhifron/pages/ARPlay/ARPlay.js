const { request, requestErrorMessage } = require('../../utils/util.js')
const { getCurrentUser, isLoggedIn } = require('../../utils/auth.js')
const { buildStaticUrl } = require('../../utils/config.js')
const { getVideoPreloadMode } = require('../../utils/resourceProfile.js')

Page({
  data: {
    project: {},
    instructionLines: [],
    arRecognitionActive: false,
    loading: true,
    loadFailed: false,
    loadErrorText: '',
    videoPreload: 'metadata',
    arPlaceholderImage: buildStaticUrl('/uploads/photo_ARExperience.png'),
    projectLoadId: ''
  },

  getArVideoList() {
    return [
      '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
      '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
      '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
      '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
    ];
  },

  onLoad(options) {
    this.initResourceProfile();
    const id = options.id;
    this.overrideVideoUrl = decodeURIComponent(options.videoUrl || '');
    if (!id) {
      wx.showToast({
        title: '缺少项目ID',
        icon: 'none'
      });
      this.setData({
        loading: false,
        loadFailed: true,
        loadErrorText: '缺少项目 ID',
        projectLoadId: ''
      });
      return;
    }
    this.setData({ projectLoadId: id });
    this.loadProject(id);
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
    const id = this.data.projectLoadId;
    if (id) {
      this.loadProject(id);
    }
  },

  loadProject(id) {
    this.setData({ loading: true, loadFailed: false, loadErrorText: '' });
    request({
      url: `/ar/projects/${id}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取项目失败');
      }
      const data = res.data || {};
      const videoList = this.getArVideoList();
      const mappedVideoById = videoList[Number(id) - 1] || '';
      const rawVideoPath = this.overrideVideoUrl || data.videoUrl || mappedVideoById || '';
      const ph = this.data.arPlaceholderImage;
      const project = {
        ...data,
        coverImage: data.coverImage
          ? (data.coverImage.startsWith('http') ? data.coverImage : buildStaticUrl(data.coverImage))
          : ph,
        markerImage: data.markerImage
          ? (data.markerImage.startsWith('http') ? data.markerImage : buildStaticUrl(data.markerImage))
          : ph,
        videoUrl: rawVideoPath.startsWith('http')
          ? rawVideoPath
          : (rawVideoPath ? buildStaticUrl(rawVideoPath) : '')
      };
      const instructionLines = (data.instruction || '').split('\n').filter(l => l.trim());
      this.setData({
        project,
        instructionLines,
        loading: false,
        loadFailed: false,
        loadErrorText: ''
      });
    }).catch(err => {
      console.error('获取AR项目失败:', err);
      this.setData({
        loading: false,
        loadFailed: true,
        loadErrorText: requestErrorMessage(err)
      });
    });
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
    // 请求相机权限
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
                      this.initiateRecognition();
                    }
                  }
                });
              }
            }
          });
        } else {
          this.initiateRecognition();
        }
      }
    });
  },
  
  // 初始化识别流程
  initiateRecognition() {
    wx.showToast({
      title: '请对准识别图开始体验',
      icon: 'none',
      duration: 2000
    });
    
    // 模拟识别过程
    setTimeout(() => {
      // 这里模拟识别成功的情况，实际应用中需要通过xr-frame或其他AR框架进行真实识别
      this.setData({
        arRecognitionActive: true
      });
      
      wx.showToast({
        title: '识别成功！',
        icon: 'success',
        duration: 1000
      });
      
      // 记录体验开始时间
      this.experienceStartTime = Date.now();
    }, 2000);
  },
  
  onUnload() {
    // 页面卸载时记录体验历史
    if (this.experienceStartTime && this.data.project.id) {
      // 检查登录状态
      if (!isLoggedIn()) {
        console.log('用户未登录，跳过保存体验记录');
        return;
      }
      
      const user = getCurrentUser();
      const userId = user && (user.id || user.userId);
      if (!userId) {
        console.warn('无法获取用户ID，跳过保存体验记录');
        return;
      }
      
      const duration = Math.round((Date.now() - this.experienceStartTime) / 1000); // 持续时间（秒）
      
      // 发送体验记录到后端
      request({
        url: '/ar/history',
        method: 'POST',
        data: {
          projectId: this.data.project.id,
          duration: duration
        }
      }).then(() => {
        console.log('体验记录保存成功');
      }).catch(err => {
        console.error('保存体验记录时发生错误:', err);
      });
    }
  }
})