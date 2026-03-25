// pages/ARProjectList/ARProjectList.js
import { request } from '../../utils/util.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    arProjects: [],
    loading: true,
    defaultArImage: buildStaticUrl('/uploads/photo_ARExperinece/deomphoto.jpg')
  },

  onLoad: function() {
    this.loadArProjects();
  },

  // 加载AR项目数据
  loadArProjects: function() {
    request({
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

  // AR项目点击
  onARProjectTap: function(e) {
    const item = e.currentTarget.dataset.item;
    this.startARExperience(item);
  },

  // 开始AR体验
  startARExperience: function(e) {
    const item = e.currentTarget.dataset.item;
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

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadArProjects().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
})

