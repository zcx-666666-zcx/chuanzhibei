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
    defaultArImage: buildStaticUrl('/uploads/photo_ARExperinece/deomphoto.jpg')
  },

  onLoad: function() {
    // 加载AR项目数据
    this.loadArProjects();
    // 加载体验记录
    this.loadHistory();
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
      // 确保图片路径正确处理
      const processedList = list.map(item => ({
        ...item,
        coverImage: item.coverImage && item.coverImage.startsWith('http') 
          ? item.coverImage 
          : buildStaticUrl(item.coverImage || '/uploads/photo_ARExperinece/deomphoto.jpg'),
        markerImage: item.markerImage && item.markerImage.startsWith('http') 
          ? item.markerImage 
          : buildStaticUrl(item.markerImage || '')
      }));
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

  // 加载体验记录
  loadHistory: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      this.setData({ experienceRecords: [] });
      return Promise.resolve();
    }
    
    const user = getCurrentUser();
    if (!user || !user.id) {
      console.warn('无法获取用户ID，跳过加载体验记录');
      this.setData({ experienceRecords: [] });
      return Promise.resolve();
    }
    
    // 先获取所有体验记录
    return request({
      url: `/ar/history?userId=${user.id}&page=1&size=100`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取体验记录失败');
      }
      const allList = res.data?.list || [];
      
      // 如果记录超过4条，删除多余的记录
      if (allList.length > 4) {
        // 调用后端API删除多余的记录（保留最近4条）
        return request({
          url: `/ar/history/cleanup?userId=${user.id}&keepCount=4`,
          method: 'DELETE'
        }).then(() => {
          // 删除成功后，只取前4条记录
          const list = allList.slice(0, 4);
          const experienceRecords = list.map(item => ({
            id: item.id,
            projectId: item.projectId,
            name: item.projectName,
            image: item.projectThumb && item.projectThumb.startsWith('http')
              ? item.projectThumb
              : buildStaticUrl(item.projectThumb || '/uploads/photo_ARExperinece/deomphoto.jpg'),
            time: this.formatTime(item.startTime),
            duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
          }));
          this.setData({ experienceRecords });
        }).catch(err => {
          console.error('删除多余体验记录失败:', err);
          // 即使删除失败，也显示前4条记录
          const list = allList.slice(0, 4);
          const experienceRecords = list.map(item => ({
            id: item.id,
            projectId: item.projectId,
            name: item.projectName,
            image: item.projectThumb && item.projectThumb.startsWith('http')
              ? item.projectThumb
              : buildStaticUrl(item.projectThumb || '/uploads/photo_ARExperinece/deomphoto.jpg'),
            time: this.formatTime(item.startTime),
            duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
          }));
          this.setData({ experienceRecords });
        });
      } else {
        // 记录不超过4条，直接显示
        const experienceRecords = allList.map(item => ({
          id: item.id,
          projectId: item.projectId,
          name: item.projectName,
          image: item.projectThumb && item.projectThumb.startsWith('http')
            ? item.projectThumb
            : buildStaticUrl(item.projectThumb || '/uploads/photo_ARExperinece/deomphoto.jpg'),
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
          url: `/pages/ARPlay/ARPlay?id=${item.id}`
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
                url: `/pages/ARPlay/ARPlay?id=${item.projectId}`
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