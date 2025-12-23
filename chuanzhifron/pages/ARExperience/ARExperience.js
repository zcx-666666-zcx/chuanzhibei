// ARExperience.js
import { request } from '../../utils/util.js'

Page({
  data: {
    arProjects: [],
    experienceRecords: [],
    loading: true
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
          : ('http://localhost:8001' + (item.coverImage || '')),
        markerImage: item.markerImage && item.markerImage.startsWith('http') 
          ? item.markerImage 
          : ('http://localhost:8001' + (item.markerImage || ''))
      }));
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

  // 加载体验记录
  loadHistory: function() {
    return request({
      url: '/ar/history'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取体验记录失败');
      }
      const list = res.data?.list || [];
      // 只保留最近的4条记录
      const recentList = list.slice(0, 4);
      const experienceRecords = recentList.map(item => ({
        id: item.id,
        projectId: item.projectId,
        name: item.projectName,
        image: item.projectThumb && item.projectThumb.startsWith('http')
          ? item.projectThumb
          : ('http://localhost:8001' + (item.projectThumb || '')),
        time: this.formatTime(item.startTime),
        duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
      }));
      this.setData({ experienceRecords });
    }).catch(err => {
      console.error('获取体验记录失败:', err);
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