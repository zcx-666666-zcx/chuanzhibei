// pages/collectionList/collectionList.js
import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    collections: [],
    loading: true
  },

  onLoad: function() {
    // 检查登录状态
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          } else {
            wx.navigateBack();
          }
        }
      });
      return;
    }
    
    this.loadCollections();
  },

  // 加载收藏数据
  loadCollections: function() {
    const user = getCurrentUser();
    if (!user) {
      this.setData({
        collections: [],
        loading: false
      });
      return;
    }
    
    const userId = user.id || user.userId;
    if (!userId) {
      console.error('无法获取用户ID');
      this.setData({
        collections: [],
        loading: false
      });
      wx.showToast({
        title: '无法获取用户信息',
        icon: 'none'
      });
      return;
    }
    
    request({
      url: `/user/collections/${userId}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取收藏失败');
      }
      
      const list = res.data || [];
      
      // 处理收藏数据，确保图片路径正确
      const collections = list.map(item => {
        let imageUrl = item.imageUrl || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = buildStaticUrl(imageUrl);
        }
        
        return {
          ...item,
          image: imageUrl,
          imageUrl: imageUrl,
          name: item.heritageName || item.name,
          level: item.heritageLevel || item.level,
          description: item.heritageDescription || item.description,
          heritageId: item.heritageId || item.id // 确保heritageId存在
        };
      });
      
      this.setData({
        collections: collections,
        loading: false
      });
    }).catch(err => {
      console.error('获取收藏失败:', err);
      this.setData({
        collections: [],
        loading: false
      });
      wx.showToast({
        title: err.message || '加载收藏失败',
        icon: 'none'
      });
    });
  },

  // 收藏点击
  onCollectionTap: function(e) {
    const item = e.currentTarget.dataset.item;
    const heritageId = item.heritageId || item.id;
    
    // 如果heritageId不存在，使用收藏数据来显示详情
    if (!heritageId) {
      wx.showToast({
        title: '收藏项信息不完整',
        icon: 'none'
      });
      return;
    }
    
    // 将收藏数据存储到全局，以便详情页使用
    const collectionData = {
      name: item.name || item.heritageName,
      description: item.description || item.heritageDescription,
      level: item.level || item.heritageLevel,
      imageUrl: item.imageUrl || item.image,
      heritageId: heritageId
    };
    
    // 临时存储收藏数据
    wx.setStorageSync('tempCollectionData', collectionData);
    
    // 跳转到非遗详情页面
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${heritageId}&fromCollection=true`
    });
  },

  // 移除收藏
  removeCollection: function(e) {
    const item = e.currentTarget.dataset.item;
    const heritageName = item.heritageName || item.name || '该项目';
    
    wx.showModal({
      title: '移除收藏',
      content: `确定要移除"${heritageName}"的收藏吗？`,
      showCancel: true,
      cancelText: '取消',
      confirmText: '确定',
      success: (res) => {
        if (res.confirm) {
          const user = getCurrentUser();
          if (!user) {
            wx.showToast({
              title: '请先登录',
              icon: 'none'
            });
            return;
          }
          
          const userId = user.id || user.userId;
          if (!userId) {
            wx.showToast({
              title: '无法获取用户信息',
              icon: 'none'
            });
            return;
          }
          
          const heritageId = item.heritageId || item.id;
          if (!heritageId) {
            wx.showToast({
              title: '收藏项信息不完整',
              icon: 'none'
            });
            return;
          }
          
          // 调用后端接口删除收藏
          request({
            url: `/user/collections/${userId}/heritage/${heritageId}`,
            method: 'DELETE'
          }).then(response => {
            if (response && response.success) {
              // 重新加载收藏列表
              this.loadCollections();
              
              wx.showToast({
                title: '已移除收藏',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: response?.message || '移除收藏失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('移除收藏失败:', err);
            wx.showToast({
              title: '移除收藏失败，请重试',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCollections().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
})

