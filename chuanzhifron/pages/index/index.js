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
    bannerList: [
      {
        id: 1,
        title: '2024年全国非遗文化节',
        description: '传承经典，弘扬中华文化',
        image: 'http://localhost:8001/uploads/banners_index/banner_1.jpg'
      },
      {
        id: 2,
        title: '陶瓷技艺入选世界非遗名录',
        description: '景德镇陶瓷烧制技艺列入人类非遗代表作名录',
        image: 'http://localhost:8001/uploads/banners_index/banner_2.jpg'
      },
      {
        id: 3,
        title: '剪纸艺术进校园活动',
        description: '全国范围内开展剪纸艺术进校园系列活动',
        image: 'http://localhost:8001/uploads/banners_index/banner_3.png'
      },
      {
        id: 4,
        title: '传统工艺创新大赛',
        description: '展现新时代工匠精神',
        image: 'http://localhost:8001/uploads/banners_index/banner_4.jpg'
      },
      {
        id: 5,
        title: '非遗文化宣传周',
        description: '让更多人了解和热爱传统文化',
        image: 'http://localhost:8001/uploads/banners_index/banner_5.jpg'
      }
    ],
    // 推荐非遗项目列表（从后端获取）
    recommendList: [],
    loading: true
  },

  onLoad: function () {
    // 加载新闻数据与推荐非遗项目
    this.loadNewsData();
    this.loadRecommendHeritage();
    
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
    }).then(res => {
      // 与后端 Result<T> 结构对齐：{ success, message, data }
      if (!res.success) {
        throw new Error(res.message || '获取新闻失败');
      }

      const list = res.data || [];

      // 处理新闻数据：补充图片与日期字段，并增加收藏状态
      const newsList = list.map(item => {
        // 处理封面图：取 imageUrls 中第一张，没有则按 id 兜底
        let image = '';
        if (item.imageUrls) {
          const first = item.imageUrls.split(',')[0].trim();
          image = first.startsWith('http')
            ? first
            : 'http://localhost:8001' + first;
        } else if (item.id != null) {
          image = `http://localhost:8001/uploads/news_index/news_${item.id}.jpg`;
        }

        // 处理发布日期，转换为字符串，供界面展示
        let dateStr = '';
        let publishTime = item.publishTime;
        if (publishTime) {
          if (typeof publishTime === 'object' && publishTime.year) {
            // Java LocalDateTime 对象
            dateStr = `${publishTime.year}-${String(publishTime.monthValue).padStart(2, '0')}-${String(publishTime.dayOfMonth).padStart(2, '0')}`;
          } else if (typeof publishTime === 'object' && Object.prototype.hasOwnProperty.call(publishTime, 'time')) {
            // 时间戳对象
            const d = new Date(publishTime.time);
            dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          } else if (typeof publishTime === 'string') {
            // 已经是字符串，按“日期 时间”拆分，只取日期部分
            dateStr = publishTime.split(' ')[0];
          }
        }

        return {
          ...item,
          image,
          date: dateStr,
          isFav: false
        };
      });
      
      // 更新轮播图数据：沿用原有图片，只同步标题与描述，并保证 ID 与新闻匹配
      const originalBannerList = this.data.bannerList;
      const bannerList = newsList.slice(0, 5).map((news, index) => ({
        id: news.id,
        title: news.title,
        description: news.description,
        image: originalBannerList[index]?.image || `http://localhost:8001/uploads/banners_index/banner_${index + 1}.jpg`
      }));
      
      this.setData({
        newsList,
        bannerList,
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

  // 加载推荐非遗项目（用于首页“推荐非遗项目”板块）
  loadRecommendHeritage: function() {
    request({
      url: '/heritage/recommended'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取推荐非遗项目失败');
      }
      const list = res.data || [];
      const recommendList = list.map(item => ({
        id: item.id,
        name: item.name,
        image: item.imageUrl && item.imageUrl.startsWith('http')
          ? item.imageUrl
          : ('http://localhost:8001' + (item.imageUrl || '')),
        region: item.region,
        category: item.category,
        level: item.level
      }));
      this.setData({
        recommendList
      });
    }).catch(err => {
      console.error('获取推荐非遗项目失败:', err);
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
    // 与轮播图点击保持一致：跳转到新闻详情页面
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${item.id}`
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
    // 跳转到可复用的非遗项目详情页面
    wx.navigateTo({
      url: `/pages/heritageDetail/heritageDetail?id=${item.id}`
    })
  },

  // 轮播图点击 - 跳转到新闻详情页面
  onBannerTap: function(e) {
    const item = e.currentTarget.dataset.item
    console.log('点击轮播图:', item)
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${item.id}`
    })
  },

  // 跳转到AR体验页面
  navigateToARExperience: function() {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  }
})