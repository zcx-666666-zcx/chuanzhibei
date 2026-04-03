// ARExperience.js
import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    arProjects: [],
    displayArProjects: [], // 首页显示的AR项目列表（只显示4个）
    experienceRecords: [],
    loading: true,
    // 演示环境下统一使用在线占位图，避免后端图片缺失导致黑屏
    defaultArImage: 'https://picsum.photos/seed/ar-scene/800/520'
  },

  // 后端 uploads/video_ARExperinece 下的 4 个本地视频
  getArVideoList() {
    return [
      '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
      '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
      '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
      '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
    ];
  },

  onLoad: function() {
    // 先加载项目，保证体验记录可拿到对应视频封面
    this.loadArProjects().finally(() => {
      this.loadHistory();
    });
    // 检查AR功能支持
    this.checkARSupport();
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
      // 确保图片路径正确处理：统一使用在线占位封面，避免本地资源缺失导致黑屏
      const processedList = list.map((item, index) => {
        const rawVideoPath = videoList[index] || item.videoUrl || '';
        return {
          ...item,
          coverImage: item.coverImage && item.coverImage.startsWith('http') 
            ? item.coverImage 
            : (this.data.defaultArImage || 'https://picsum.photos/seed/ar-cover-'+index+'/800/520'),
          markerImage: item.markerImage && item.markerImage.startsWith('http') 
            ? item.markerImage 
            : 'https://picsum.photos/seed/ar-marker-'+index+'/640/360',
          videoUrl: rawVideoPath && rawVideoPath.startsWith('http')
            ? rawVideoPath
            : (rawVideoPath ? buildStaticUrl(rawVideoPath) : '')
        };
      });
      // 首页只显示前4个AR项目
      const displayArProjects = processedList.slice(0, 4);
      this.setData({
        arProjects: processedList,
        displayArProjects: displayArProjects,
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
              : (this.data.defaultArImage || 'https://picsum.photos/seed/ar-history-'+index+'/800/520'),
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
              : (this.data.defaultArImage || 'https://picsum.photos/seed/ar-history-'+index+'/800/520'),
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
            : (this.data.defaultArImage || 'https://picsum.photos/seed/ar-history-'+index+'/800/520'),
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

  // 检查AR功能支持
  checkARSupport: function() {
    wx.getSystemInfo({
      success: (res) => {
        console.log('设备信息:', res);
        // 这里可以添加AR功能检测逻辑
      }
    });
  },

  // AR项目点击
  onARProjectTap: function(e) {
    const item = e.currentTarget.dataset.item;
    this.startARExperience(item);
  },

  // 预览视频元数据加载完成后，跳到末尾并暂停，作为“最后一帧封面”
  onPreviewMetaLoaded(e) {
    const index = e.currentTarget.dataset.index;
    const duration = Number(e.detail && e.detail.duration) || 0;
    if (index === undefined || !duration) return;

    const ctx = wx.createVideoContext(`preview-video-${index}`, this);
    const seekTo = Math.max(duration - 0.1, 0);

    // 某些机型需要先播放再 seek，才能稳定显示目标帧
    ctx.play();
    setTimeout(() => {
      ctx.seek(seekTo);
      setTimeout(() => {
        ctx.pause();
      }, 120);
    }, 80);
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

  // 开始AR体验
  startARExperience: function(item) {
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