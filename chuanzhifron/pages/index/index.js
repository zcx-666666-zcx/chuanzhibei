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
    recommendList: [
      {
        id: 1,
        name: '书法',
        image: 'https://s.coze.cn/image/VOG-SbZf2KQ/'
      },
      {
        id: 2,
        name: '刺绣',
        image: 'https://s.coze.cn/image/tztU_nPiuas/'
      },
      {
        id: 3,
        name: '中医药',
        image: 'https://s.coze.cn/image/pJnL6QQmRwQ/'
      },
      {
        id: 4,
        name: '武术',
        image: 'https://s.coze.cn/image/e39bZ7dgw8E/'
      }
    ],
    loading: true
  },

  onLoad: function () {
    // 加载新闻数据
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
    wx.showToast({
      title: `查看项目：${item.name}`,
      icon: 'none'
    })
  },

  // 跳转到AR体验页面
  navigateToARExperience: function() {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  }
})