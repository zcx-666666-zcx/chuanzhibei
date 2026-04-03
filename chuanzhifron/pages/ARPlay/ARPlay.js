import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    project: {},
    instructionLines: [],
    arRecognitionActive: false
  },

  getArVideoList() {
    return [
      '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
      '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
      '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
      '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
    ];
  },

  onLoad(options) {
    const id = options.id;
    this.overrideVideoUrl = decodeURIComponent(options.videoUrl || '');
    if (!id) {
      wx.showToast({
        title: '缺少项目ID',
        icon: 'none'
      });
      return;
    }
    this.loadProject(id);
  },

  loadProject(id) {
    request({
      url: `/ar/projects/${id}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取项目失败');
      }
      const data = res.data || {};
      const videoList = this.getArVideoList();
      const mappedVideoById = videoList[Number(id) - 1] || '';
      const rawVideoPath = this.overrideVideoUrl || mappedVideoById || data.videoUrl || '';
      const project = {
        ...data,
        coverImage: data.coverImage && data.coverImage.startsWith('http') 
          ? data.coverImage 
          : buildStaticUrl(data.coverImage || ''),
        markerImage: data.markerImage && data.markerImage.startsWith('http') 
          ? data.markerImage 
          : buildStaticUrl(data.markerImage || ''),
        videoUrl: rawVideoPath.startsWith('http')
          ? rawVideoPath
          : buildStaticUrl(rawVideoPath)
      };
      const instructionLines = (data.instruction || '').split('\n').filter(l => l.trim());
      this.setData({
        project,
        instructionLines
      });
    }).catch(err => {
      console.error('获取AR项目失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
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
      if (!user || !user.id) {
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