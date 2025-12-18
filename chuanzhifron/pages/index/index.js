// index.js
const app = getApp()
import { request } from '../../utils/util.js'

Page({
  data: {
    motto: '非遗传承 - 智慧生活',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newsList: [],
    bannerList: [],
    recommendList: [],
    loading: true,
    loadError: false
  },

  onLoad: function () {
    // 并行请求所有首页数据
    this.loadHomeConfig();
    this.loadNewsData();
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  // 获取首页配置数据
  loadHomeConfig: function() {
    // 使用Promise.all并行请求banner和推荐项目数据
    Promise.all([
      request({ url: '/index/banner' }),
      request({ url: '/index/recommend-heritage' })
    ]).then(([bannerData, recommendData]) => {
      this.setData({
        bannerList: bannerData,
        recommendList: recommendData,
        loading: false,
        loadError: false
      });
    }).catch(err => {
      console.error('获取首页配置失败:', err);
      this.setData({
        loading: false,
        loadError: true
      });
      wx.showToast({
        title: '加载配置失败',
        icon: 'none'
      });
    });
  },

  // 重新加载首页配置数据
  reloadHomeConfig: function() {
    this.setData({
      loading: true,
      loadError: false
    });
    this.loadHomeConfig();
  },

  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 搜索功能
  onSearch: function() {
    wx.showToast({
      title: '搜索功能开发中',
      icon: 'none'
    })
  },
  
  // 加载新闻数据
  loadNewsData: function() {
    request({
      url: '/news/recent'
    }).then(data => {
      // 处理数据格式
      const newsList = data.map(item => ({
        ...item,
        isFav: false
      }));
      this.setData({
        newsList: newsList,
        loading: false
      });
    }).catch(err => {
      console.error('获取新闻失败:', err);
      this.setData({
        loading: false
      });
      wx.showToast({
        title: '加载新闻失败',
        icon: 'none'
      });
    });
  },

  // 通知功能
  onNotification: function() {
    wx.showToast({
      title: '通知功能开发中',
      icon: 'none'
    })
  },

  // 新闻点击
  onNewsTap: function(e) {
    const item = e.currentTarget.dataset.item
    wx.showToast({
      title: `查看新闻：${item.title}`,
      icon: 'none'
    })
  },

  // 收藏功能
  onFavTap: function(e) {
    const item = e.currentTarget.dataset.item
    const newsList = this.data.newsList
    const index = newsList.findIndex(news => news.id === item.id)
    
    if (index !== -1) {
      newsList[index].isFav = !newsList[index].isFav
      this.setData({
        newsList: newsList
      })
      
      wx.showToast({
        title: newsList[index].isFav ? '已收藏' : '已取消收藏',
        icon: 'none'
      })
    }
  },

  // 推荐项目点击
  onRecommendTap: function(e) {
    const item = e.currentTarget.dataset.item
    // 跳转到非遗项目详情页
    wx.navigateTo({
      url: `/pages/Heritage/Heritage?id=${item.id}`
    })
  },

  // 轮播图点击
  onBannerTap: function(e) {
    const item = e.currentTarget.dataset.item
    
    // 根据后端返回的target_type和target_path进行跳转
    if (item.target_type === 1) {
      // 内部页面跳转
      wx.navigateTo({
        url: item.target_path
      });
    } else if (item.target_type === 2) {
      // 外部链接跳转（使用web-view）
      wx.navigateTo({
        url: `/pages/webview/webview?url=${encodeURIComponent(item.target_path)}`
      });
    }
  },

  // 跳转到AR体验页面
  navigateToARExperience: function() {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  }
})