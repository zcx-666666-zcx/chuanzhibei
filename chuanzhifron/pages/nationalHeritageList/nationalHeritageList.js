// pages/nationalHeritageList/nationalHeritageList.js
import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    currentCategory: 'all',
    heritageList: [],
    loading: true
  },

  onLoad: function(options) {
    // 获取传递过来的分类参数
    const category = options.category || 'all';
    this.setData({
      currentCategory: category
    });
    this.loadHeritageData();
  },

  // 加载非遗数据
  loadHeritageData: function() {
    request({
      url: '/heritage'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取非遗数据失败');
      }
      
      const data = res.data || [];
      
      // 处理图片路径，补充服务器地址
      const processedData = data.map(item => ({
        ...item,
        image: item.imageUrl && item.imageUrl.startsWith('http')
          ? item.imageUrl
          : buildStaticUrl(item.imageUrl || '')
      }));
      
      // 只获取国家级项目（level === 1）
      let nationalList = processedData.filter(item => item.level === 1);
      
      // 根据分类筛选
      if (this.data.currentCategory !== 'all') {
        nationalList = nationalList.filter(item => item.category === this.data.currentCategory);
      }
      
      this.setData({
        heritageList: nationalList,
        loading: false
      });
      
      // 检查收藏状态
      this.checkFavoriteStatus();
    }).catch(err => {
      console.error('获取非遗数据失败:', err);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '加载数据失败',
        icon: 'none'
      });
    });
  },

  // 分类筛选
  onCategoryChange: function(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      currentCategory: category
    });
    this.loadHeritageData();
  },

  // 非遗项目点击
  onHeritageTap: function(e) {
    const item = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    });
  },

  // 检查收藏状态
  checkFavoriteStatus: function() {
    if (!isLoggedIn()) {
      return;
    }
    
    const user = getCurrentUser();
    if (!user) {
      return;
    }
    
    // 获取用户ID
    const userId = user.id || user.userId || null;
    if (!userId) {
      console.warn('无法获取用户ID');
      return;
    }
    
    const { heritageList } = this.data;
    if (heritageList.length === 0) {
      return;
    }
    
    // 批量检查收藏状态
    const heritageIds = heritageList.map(item => item.id).filter(id => id);
    if (heritageIds.length === 0) {
      return;
    }
    
    // 逐个检查收藏状态
    heritageList.forEach((item, index) => {
      request({
        url: `/user/collections/${userId}/check/${item.id}`
      }).then(res => {
        if (res.success) {
          const updatedList = [...this.data.heritageList];
          updatedList[index].isFavorite = res.data || false;
          this.setData({
            heritageList: updatedList
          });
        }
      }).catch(err => {
        console.error(`检查收藏状态失败 (heritageId: ${item.id}):`, err);
      });
    });
  },

  // 切换收藏状态
  toggleFavorite: function(e) {
    const item = e.currentTarget.dataset.item;
    
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
          }
        }
      });
      return;
    }
    
    const user = getCurrentUser();
    if (!user) {
      wx.showModal({
        title: '提示',
        content: '用户信息获取失败，请重新登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    // 获取用户ID - 修复：直接使用 user.id
    const userId = user.id || null;
    if (!userId) {
      console.error('用户信息:', user);
      wx.showModal({
        title: '提示',
        content: '无法获取用户ID，请重新登录',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }
        }
      });
      return;
    }
    
    const heritageId = item.id;
    const isFavorite = item.isFavorite || false;
    
    // 更新UI状态（乐观更新）
    const updatedList = this.data.heritageList.map(heritage => {
      if (heritage.id === heritageId) {
        return { ...heritage, isFavorite: !isFavorite };
      }
      return heritage;
    });
    this.setData({
      heritageList: updatedList
    });
    
    if (isFavorite) {
      // 取消收藏
      request({
        url: `/user/collections/${userId}/heritage/${heritageId}`,
        method: 'DELETE'
      }).then(res => {
        if (res.success) {
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        } else {
          // 回滚UI状态
          const rollbackList = this.data.heritageList.map(heritage => {
            if (heritage.id === heritageId) {
              return { ...heritage, isFavorite: true };
            }
            return heritage;
          });
          this.setData({
            heritageList: rollbackList
          });
          wx.showToast({
            title: '取消收藏失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('取消收藏失败:', err);
        // 回滚UI状态
        const rollbackList = this.data.heritageList.map(heritage => {
          if (heritage.id === heritageId) {
            return { ...heritage, isFavorite: true };
          }
          return heritage;
        });
        this.setData({
          heritageList: rollbackList
        });
        wx.showToast({
          title: '取消收藏失败',
          icon: 'none'
        });
      });
    } else {
      // 添加收藏
      const levelText = item.level === 1 ? '国家级非遗项目'
        : item.level === 2 ? '省级非遗项目'
        : '非物质文化遗产项目';
      
      const collectionData = {
        userId: userId,
        heritageId: heritageId,
        heritageName: item.name,
        heritageDescription: item.description || '',
        heritageLevel: levelText,
        imageUrl: item.image || item.imageUrl || ''
      };
      
      request({
        url: '/user/collections',
        method: 'POST',
        data: collectionData
      }).then(res => {
        if (res.success) {
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          });
        } else {
          // 回滚UI状态
          const rollbackList = this.data.heritageList.map(heritage => {
            if (heritage.id === heritageId) {
              return { ...heritage, isFavorite: false };
            }
            return heritage;
          });
          this.setData({
            heritageList: rollbackList
          });
          wx.showToast({
            title: res.message || '收藏失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('收藏失败:', err);
        // 回滚UI状态
        const rollbackList = this.data.heritageList.map(heritage => {
          if (heritage.id === heritageId) {
            return { ...heritage, isFavorite: false };
          }
          return heritage;
        });
        this.setData({
          heritageList: rollbackList
        });
        wx.showToast({
          title: '收藏失败',
          icon: 'none'
        });
      });
    }
  }
})

