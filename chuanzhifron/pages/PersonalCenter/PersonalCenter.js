// PersonalCenter.js
import { request } from '../../utils/util.js'
import { getCurrentUser } from '../../utils/auth.js'

Page({
  data: {
    userInfo: {
      name: '访客',
      title: '非遗文化爱好者',
      avatar: 'https://s.coze.cn/image/Ex1Uxeu9hO8/'
    },
    userStats: {
      collections: 0,
      creations: 0,
      bookings: 0
    },
    collections: [],
    creations: [],
    bookings: [
      {
        id: 1,
        masterName: '张明远',
        skill: '剪纸体验',
        time: '2024-06-20 14:00-16:00',
        masterAvatar: 'https://s.coze.cn/image/QWiQen_znu8/',
        status: 'confirmed',
        statusText: '已预约'
      }
    ],
    loading: true
  },

  onLoad: function() {
    // 页面加载时的初始化
    // 检查用户登录状态
    const user = getCurrentUser();
    if (user) {
      this.setData({
        'userInfo.name': user.nickName || user.name,
        'userInfo.avatar': user.avatarUrl || user.avatar
      });
    }
    
    this.loadCollections();
    this.loadCreations();
  },
  
  // 加载收藏数据
  loadCollections: function() {
    // 获取当前用户ID
    const user = getCurrentUser();
    const userId = user?.id || user?.userId || 1; // 如果没有用户ID，使用默认值1
    
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
          imageUrl = 'http://localhost:8001' + imageUrl;
        }
        
        return {
          ...item,
          image: imageUrl, // 添加image字段用于兼容wxml
          imageUrl: imageUrl,
          name: item.heritageName || item.name,
          level: item.heritageLevel || item.level,
          description: item.heritageDescription || item.description
        };
      });
      
      this.setData({
        collections: collections,
        'userStats.collections': collections.length,
        loading: false
      });
    }).catch(err => {
      console.error('获取收藏失败:', err);
      // 如果接口失败，尝试从本地存储加载
      this.loadCollectionsFromLocal();
    });
  },

  // 从本地存储加载收藏数据
  loadCollectionsFromLocal: function() {
    try {
      const collections = wx.getStorageSync('userCollections') || [];
      const processedCollections = collections.map(item => {
        let imageUrl = item.imageUrl || item.image || '';
        if (imageUrl && !imageUrl.startsWith('http')) {
          imageUrl = 'http://localhost:8001' + imageUrl;
        }
        
        return {
          ...item,
          image: imageUrl,
          imageUrl: imageUrl,
          name: item.heritageName || item.name,
          level: item.heritageLevel || item.level,
          description: item.heritageDescription || item.description
        };
      });
      
      this.setData({
        collections: processedCollections,
        'userStats.collections': processedCollections.length,
        loading: false
      });
    } catch (e) {
      console.error('从本地加载收藏失败:', e);
      this.setData({
        collections: [],
        'userStats.collections': 0,
        loading: false
      });
    }
  },
  
  // 加载创作数据
  loadCreations: function() {
    // 使用模拟数据，模拟从后端返回的格式
    const mockCreations = [
      {
        id: 1,
        userId: 1,
        userName: '非遗爱好者',
        userAvatar: 'https://s.coze.cn/image/Ex1Uxeu9hO8/',
        content: '今天参观了苏绣展览，感受到了传统工艺的精美，每一针每一线都体现着匠人精神。',
        imageUrls: 'http://localhost:8001/api/files/master_suxiu.jpg',
        likesCount: 45,
        commentsCount: 8,
        isLiked: true,
        createTime: '2024-05-15T14:30:00',
        updateTime: '2024-05-15T14:30:00'
      },
      {
        id: 2,
        userId: 1,
        userName: '非遗爱好者',
        userAvatar: 'https://s.coze.cn/image/Ex1Uxeu9hO8/',
        content: '学习了景泰蓝的制作过程，从掐丝到点蓝，每一步都需要极高的技艺和耐心。',
        imageUrls: 'http://localhost:8001/api/files/master_jingjumei.jpg,http://localhost:8001/api/files/master_jingtai.jpg',
        likesCount: 78,
        commentsCount: 15,
        isLiked: false,
        createTime: '2024-05-10T16:45:00',
        updateTime: '2024-05-10T16:45:00'
      }
    ];
    
    // 模拟API响应格式
    const response = {
      success: true,
      message: "操作成功",
      data: mockCreations
    };
    
    this.setData({
      creations: response.data.map(post => ({
        id: post.id,
        title: post.content.substring(0, 20) + (post.content.length > 20 ? '...' : ''),
        image: post.imageUrls ? post.imageUrls.split(',')[0] : ''
      })),
      'userStats.creations': response.data.length,
      loading: false
    });
  },

  // 设置按钮
  onSettings: function() {
    wx.showActionSheet({
      itemList: ['编辑资料', '隐私设置', '通知设置'],
      success: (res) => {
        const actions = ['编辑资料', '隐私设置', '通知设置'];
        wx.showToast({
          title: `选择了：${actions[res.tapIndex]}`,
          icon: 'none'
        });
      }
    });
  },

  // 收藏点击
  onCollectionTap: function(e) {
    const item = e.currentTarget.dataset.item;
    const heritageId = item.heritageId || item.id;
    
    // 跳转到非遗详情页面
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${heritageId}`
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
          const userId = user?.id || user?.userId || 1;
          const heritageId = item.heritageId || item.id;
          
          // 调用后端接口删除收藏
          request({
            url: `/user/collections/${userId}/heritage/${heritageId}`,
            method: 'DELETE'
          }).then(response => {
            if (response && response.success) {
              // 更新本地数据
              const collections = this.data.collections.filter(collection => {
                return (collection.heritageId || collection.id) !== heritageId;
              });
              
              // 同步更新本地存储
              try {
                wx.setStorageSync('userCollections', collections);
              } catch (e) {
                console.error('保存收藏到本地失败:', e);
              }
              
              this.setData({
                collections: collections,
                'userStats.collections': collections.length
              });
              
              wx.showToast({
                title: '已移除收藏',
                icon: 'success'
              });
            } else {
              wx.showToast({
                title: '移除收藏失败',
                icon: 'none'
              });
            }
          }).catch(err => {
            console.error('移除收藏失败:', err);
            // 即使接口失败，也更新本地状态
            const collections = this.data.collections.filter(collection => {
              return (collection.heritageId || collection.id) !== heritageId;
            });
            
            try {
              wx.setStorageSync('userCollections', collections);
            } catch (e) {
              console.error('保存收藏到本地失败:', e);
            }
            
            this.setData({
              collections: collections,
              'userStats.collections': collections.length
            });
            
            wx.showToast({
              title: '已移除收藏',
              icon: 'success'
            });
          });
        }
      }
    });
  },

  // 创作点击
  onCreationTap: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: item.title,
      content: '查看创作详情',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 添加创作
  addCreation: function() {
    wx.showActionSheet({
      itemList: ['拍照', '从相册选择', '录制视频'],
      success: (res) => {
        const actions = ['拍照', '从相册选择', '录制视频'];
        wx.showToast({
          title: `选择了：${actions[res.tapIndex]}`,
          icon: 'none'
        });
      }
    });
  },

  // 取消预约
  cancelBooking: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.showModal({
      title: '取消预约',
      content: `确定要取消"${item.masterName} - ${item.skill}"的预约吗？`,
      showCancel: true,
      cancelText: '不取消',
      confirmText: '确定取消',
      success: (res) => {
        if (res.confirm) {
          const bookings = this.data.bookings.filter(booking => booking.id !== item.id);
          this.setData({
            bookings: bookings,
            'userStats.bookings': this.data.userStats.bookings - 1
          });
          wx.showToast({
            title: '已取消预约',
            icon: 'success'
          });
        }
      }
    });
  },

  // 查看全部收藏
  viewAllCollections: function() {
    wx.showToast({
      title: '查看全部收藏',
      icon: 'none'
    });
  },

  // 查看全部创作
  viewAllCreations: function() {
    wx.showToast({
      title: '查看全部创作',
      icon: 'none'
    });
  },

  // 查看全部预约
  viewAllBookings: function() {
    wx.showToast({
      title: '查看全部预约',
      icon: 'none'
    });
  },

  // 菜单点击
  onMenuTap: function(e) {
    const type = e.currentTarget.dataset.type;
    const menuMap = {
      profile: '个人资料',
      settings: '设置',
      help: '帮助与反馈',
      about: '关于我们'
    };
    
    if (type === 'settings') {
      wx.showActionSheet({
        itemList: ['编辑资料', '隐私设置', '通知设置', '退出登录'],
        success: (res) => {
          if (res.tapIndex === 3) {
            // 退出登录
            wx.showModal({
              title: '退出登录',
              content: '确定要退出登录吗？',
              success: (res) => {
                if (res.confirm) {
                  // 清除用户信息
                  wx.removeStorageSync('token');
                  wx.removeStorageSync('userInfo');
                  
                  // 跳转到登录页面
                  wx.redirectTo({
                    url: '/pages/login/login'
                  });
                }
              }
            });
          } else {
            wx.showModal({
              title: menuMap[type],
              content: `${['编辑资料', '隐私设置', '通知设置'][res.tapIndex]}功能开发中`,
              showCancel: false,
              confirmText: '知道了'
            });
          }
        }
      });
    } else {
      wx.showModal({
        title: menuMap[type],
        content: `${menuMap[type]}功能开发中`,
        showCancel: false,
        confirmText: '知道了'
      });
    }
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    this.setData({
      loading: true
    });
    
    // 重新加载数据
    this.loadCollections();
    this.loadCreations();
    
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    }, 1000);
  }
})