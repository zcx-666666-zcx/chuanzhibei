// pages/ARProjectList/ARProjectList.js
const { request } = require('../../utils/util.js')
const { buildStaticUrl } = require('../../utils/config.js')
const { getVideoPreloadMode } = require('../../utils/resourceProfile.js')

Page({
  data: {
    arProjects: [],
    loading: true,
    videoPreload: 'metadata',
    arPlaceholderImage: buildStaticUrl('/uploads/photo_ARExperience.png')
  },

  getArVideoList() {
    // 与后端 AR 项目 id 1~4 顺序一致：景德镇 → 苏绣 → 青铜器 → 少林
    return [
      '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
      '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
      '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
      '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
    ];
  },

  onLoad: function() {
    this.initResourceProfile();
    this.loadArProjects();
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

  // 加载AR项目数据
  loadArProjects: function() {
    this.setData({ loading: true });
    return request({
      url: '/ar/projects',
      data: {
        page: 1,
        size: 100
      }
    }).then(res => {
      const list = res.data?.list || res.data || [];
      const videoList = this.getArVideoList();
      const ph = this.data.arPlaceholderImage;
      const processedList = list.map((item, index) => {
        const rawVideoPath = item.videoUrl || videoList[index] || '';
        const cover = item.coverImage
          ? (item.coverImage.startsWith('http') ? item.coverImage : buildStaticUrl(item.coverImage))
          : ph;
        const marker = item.markerImage
          ? (item.markerImage.startsWith('http') ? item.markerImage : buildStaticUrl(item.markerImage))
          : cover;
        return {
          ...item,
          coverImage: cover,
          markerImage: marker,
          videoUrl: rawVideoPath && rawVideoPath.startsWith('http')
            ? rawVideoPath
            : (rawVideoPath ? buildStaticUrl(rawVideoPath) : '')
        };
      });
      this.setData({
        arProjects: processedList,
        loading: false
      });
    }).catch(err => {
      console.error('获取AR项目失败:', err);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: err.message || '加载AR项目失败',
        icon: 'none'
      });
      throw err;
    });
  },

  // AR项目点击
  onARProjectTap: function(e) {
    const item = e.currentTarget.dataset.item;
    this.startARExperience(item);
  },

  // 开始AR体验
  startARExperience: function(e) {
    const item = e && e.currentTarget ? e.currentTarget.dataset.item : e;
    // 检查相机权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.camera'] === false) {
          wx.showModal({
            title: '需要相机权限',
            content: 'AR体验需要访问您的相机，请在设置中开启相机权限',
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }
        
        wx.navigateTo({
          url: `/pages/ARPlay/ARPlay?id=${item.id}&videoUrl=${encodeURIComponent(item.videoUrl || '')}`
        });
      }
    });
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

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadArProjects().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
})
