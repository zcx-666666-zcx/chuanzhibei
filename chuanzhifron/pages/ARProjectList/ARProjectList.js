// pages/ARProjectList/ARProjectList.js
import { request } from '../../utils/util.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    arProjects: [],
    loading: true,
    // 统一使用在线占位图，保障演示场景下有稳定封面
    defaultArImage: 'https://picsum.photos/seed/ar-list/800/520'
  },

  getArVideoList() {
    return [
      '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
      '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
      '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
      '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
    ];
  },

  onLoad: function() {
    this.loadArProjects();
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
      // 确保图片路径正确处理：统一使用在线占位封面，避免本地资源缺失导致黑屏
      const processedList = list.map((item, index) => {
        const rawVideoPath = videoList[index] || item.videoUrl || '';
        return {
          ...item,
          coverImage: item.coverImage && item.coverImage.startsWith('http')
            ? item.coverImage
            : (this.data.defaultArImage || 'https://picsum.photos/seed/ar-list-'+index+'/800/520'),
          markerImage: item.markerImage && item.markerImage.startsWith('http')
            ? item.markerImage
            : 'https://picsum.photos/seed/ar-marker-list-'+index+'/640/360',
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
