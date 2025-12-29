// pages/creationList/creationList.js
import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'

Page({
  data: {
    creations: [],
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
    
    this.loadCreations();
  },

  // 加载创作数据
  loadCreations: function() {
    const user = getCurrentUser();
    if (!user) {
      this.setData({
        creations: [],
        loading: false
      });
      return;
    }
    
    const userId = user.id || user.userId;
    if (!userId) {
      this.setData({
        creations: [],
        loading: false
      });
      return;
    }
    
    // 从后端API加载用户的社区帖子
    request({
      url: `/community/posts/${userId}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取创作失败');
      }
      
      const list = res.data || [];
      
      // 处理创作数据，转换为创作格式
      const creations = list.map(item => {
        // 处理图片
        let images = [];
        if (item.imageUrls) {
          const urlList = typeof item.imageUrls === 'string' ? item.imageUrls.split(',') : item.imageUrls;
          images = urlList.map(url => {
            const trimmedUrl = url.trim();
            return trimmedUrl.startsWith('http') ? trimmedUrl : 'http://localhost:8001' + trimmedUrl;
          }).filter(url => url);
        }
        
        // 处理头像
        let avatar = item.userAvatar || '';
        if (avatar && !avatar.startsWith('http')) {
          avatar = 'http://localhost:8001' + avatar;
        }
        
        // 格式化时间
        let createTime = item.createTime || '';
        if (createTime) {
          try {
            const date = new Date(createTime);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hour = String(date.getHours()).padStart(2, '0');
              const minute = String(date.getMinutes()).padStart(2, '0');
              createTime = `${year}-${month}-${day} ${hour}:${minute}`;
            }
          } catch (e) {
            console.error('时间格式化错误:', e);
          }
        }
        
        return {
          id: item.id,
          title: (item.content || '').substring(0, 30) + ((item.content || '').length > 30 ? '...' : ''),
          content: item.content || '',
          image: images.length > 0 ? images[0] : '',
          images: images,
          likesCount: item.likesCount || 0,
          commentsCount: item.commentsCount || 0,
          isLiked: item.isLiked || false,
          createTime: createTime,
          userName: item.userName || user.nickname || user.nickName || user.username || '我',
          userAvatar: avatar
        };
      });
      
      this.setData({
        creations: creations,
        loading: false
      });
    }).catch(err => {
      console.error('获取创作失败:', err);
      this.setData({
        creations: [],
        loading: false
      });
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    });
  },

  // 创作点击
  onCreationTap: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '创作详情',
      content: item.content,
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 添加创作
  addCreation: function() {
    // 跳转到个人中心页面，使用发布帖子功能
    wx.navigateBack();
    // 或者直接跳转到个人中心
    // wx.switchTab({
    //   url: '/pages/PersonalCenter/PersonalCenter'
    // });
  },

  // 删除创作
  deleteCreation: function(e) {
    const item = e.currentTarget.dataset.item;
    const that = this;
    
    wx.showModal({
      title: '删除创作',
      content: '确定要删除这条创作吗？',
      showCancel: true,
      cancelText: '取消',
      confirmText: '删除',
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
          
          const postId = item.id;
          if (!postId) {
            wx.showToast({
              title: '创作信息不完整',
              icon: 'none'
            });
            return;
          }
          
          // 调用后端接口删除帖子
          request({
            url: `/community/posts/${postId}`,
            method: 'DELETE'
          }).then(response => {
            if (response && response.success) {
              // 重新加载创作列表
              that.loadCreations();
              
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: response?.message || '删除失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('删除创作失败:', err);
            wx.showToast({
              title: '删除失败，请重试',
              icon: 'none'
            });
          });
        }
      }
    });
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.loadCreations();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 500);
  }
})

