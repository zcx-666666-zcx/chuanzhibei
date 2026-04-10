// ARExperience.js
const { request } = require('../../utils/util.js')
const { getCurrentUser, isLoggedIn } = require('../../utils/auth.js')
const { buildStaticUrl } = require('../../utils/config.js')
const { getVideoPreloadMode } = require('../../utils/resourceProfile.js')

Page({
  data: {
    arProjects: [],
    experienceRecords: [],
    loading: true,
    videoPreload: 'metadata',
    /** 示意图与 AR 封面兜底：uploads 静态资源，避免外链审核风险 */
    arPlaceholderImage: buildStaticUrl('/uploads/photo_ARExperience.png')
  },

  // 后端 uploads/video_ARExperinece 下的 4 个本地视频
  getArVideoList() {
    return [
      '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
      '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
      '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
      '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
    ];
  },

  onLoad: function() {
    this.initResourceProfile();
    // 先加载项目，保证体验记录可拿到对应视频封面
    this.loadArProjects().finally(() => {
      this.loadHistory();
    });
    // 检查AR功能支持
    this.checkARSupport();
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
    return request({
      url: '/ar/projects'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取AR项目失败');
      }
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
        title: '加载AR项目失败',
        icon: 'none'
      });
    });
  },

  getVideoUrlByProjectId(projectId) {
    const project = (this.data.arProjects || []).find(p => String(p.id) === String(projectId));
    if (project && project.videoUrl) {
      return project.videoUrl;
    }
    return '';
  },

  // 加载体验记录
  loadHistory: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      this.setData({ experienceRecords: [] });
      return Promise.resolve();
    }
    
    const user = getCurrentUser();
    if (!user || !(user.id || user.userId)) {
      console.warn('无法获取用户信息，跳过加载体验记录');
      this.setData({ experienceRecords: [] });
      return Promise.resolve();
    }
    
    // 先获取所有体验记录
    return request({
      url: '/ar/history?page=1&size=100'
    }).then(res => {
      const allList = res.data?.list || [];
      const ph = this.data.arPlaceholderImage;

      // 如果记录超过4条，删除多余的记录
      if (allList.length > 4) {
        // 调用后端API删除多余的记录（保留最近4条）
        return request({
          url: '/ar/history/cleanup?keepCount=4',
          method: 'DELETE'
        }).then(() => {
          // 删除成功后，只取前4条记录
          const list = allList.slice(0, 4);
          const experienceRecords = list.map((item, index) => ({
            id: item.id,
            projectId: item.projectId,
            name: item.projectName,
            image: item.projectThumb && item.projectThumb.startsWith('http')
              ? item.projectThumb
              : (item.projectThumb ? buildStaticUrl(item.projectThumb) : ph),
            videoUrl: this.getVideoUrlByProjectId(item.projectId),
            time: this.formatTime(item.startTime),
            duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
          }));
          this.setData({ experienceRecords });
        }).catch(err => {
          console.error('删除多余体验记录失败:', err);
          // 即使删除失败，也显示前4条记录
          const list = allList.slice(0, 4);
          const experienceRecords = list.map((item, index) => ({
            id: item.id,
            projectId: item.projectId,
            name: item.projectName,
            image: item.projectThumb && item.projectThumb.startsWith('http')
              ? item.projectThumb
              : (item.projectThumb ? buildStaticUrl(item.projectThumb) : ph),
            videoUrl: this.getVideoUrlByProjectId(item.projectId),
            time: this.formatTime(item.startTime),
            duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
          }));
          this.setData({ experienceRecords });
        });
      } else {
        // 记录不超过4条，直接显示
        const experienceRecords = allList.map((item, index) => ({
          id: item.id,
          projectId: item.projectId,
          name: item.projectName,
          image: item.projectThumb && item.projectThumb.startsWith('http')
            ? item.projectThumb
            : (item.projectThumb ? buildStaticUrl(item.projectThumb) : ph),
          videoUrl: this.getVideoUrlByProjectId(item.projectId),
          time: this.formatTime(item.startTime),
          duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
        }));
        this.setData({ experienceRecords });
      }
    }).catch(err => {
      console.error('获取体验记录失败:', err);
      this.setData({ experienceRecords: [] });
    });
  },

  goARProjectListFull() {
    wx.navigateTo({ url: '/pages/ARProjectList/ARProjectList' });
  },

  onArProjectTap(e) {
    const item = e.currentTarget.dataset.item;
    if (!item || item.id == null) return;
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

  // 检查AR功能支持
  checkARSupport: function() {
    wx.getSystemInfo({
      success: (res) => {
        console.log('设备信息:', res);
        // 这里可以添加AR功能检测逻辑
      }
    });
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

  // 重新体验
  replayExperience: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '重新体验',
      content: `确定要重新体验"${item.name}"吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
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
                url: `/pages/ARPlay/ARPlay?id=${item.projectId}&videoUrl=${encodeURIComponent(item.videoUrl || '')}`
              });
            }
          });
        }
      }
    });
  },

  // 简单格式化时间（兼容对象与字符串）
  formatTime(val) {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      // 兼容 LocalDateTime 结构
      const y = val.year || '';
      const m = val.monthValue ? String(val.monthValue).padStart(2, '0') : '';
      const d = val.dayOfMonth ? String(val.dayOfMonth).padStart(2, '0') : '';
      const hh = val.hour != null ? String(val.hour).padStart(2, '0') : '00';
      const mm = val.minute != null ? String(val.minute).padStart(2, '0') : '00';
      return `${y}-${m}-${d} ${hh}:${mm}`;
    }
    return '';
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    Promise.all([this.loadArProjects(), this.loadHistory()]).finally(() => {
      wx.stopPullDownRefresh();
    });
  }
})