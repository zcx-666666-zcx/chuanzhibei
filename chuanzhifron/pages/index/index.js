// index.js
const app = getApp()
// NOTE: utils/config.js 和 utils/util.js 使用的是 CommonJS 的 module.exports，
// 在小程序端用 require 引入更稳，避免 import 的命名导出兼容性问题。
const { request, requestErrorMessage } = require('../../utils/util.js')
const { isLoggedIn } = require('../../utils/auth.js')
const { buildStaticUrl, DEFAULT_IMAGE_DATA_URI } = require('../../utils/config.js')
const { normalizeNewsResponseData, mapNewsItem } = require('../../utils/newsDisplay.js')

const HOME_NEWS_FETCH_SIZE = 20
const HOME_NEWS_DISPLAY = 5

Page({
  normalizeList(data) {
    if (Array.isArray(data)) {
      return data;
    }
    if (data && Array.isArray(data.list)) {
      return data.list;
    }
    return [];
  },
  data: {
    motto: '非遗传承 - 智慧生活',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    newsList: [],
    displayNewsList: [], // 首页显示的新闻列表（只显示3条）
    bannerList: [],
    logoUrl: buildStaticUrl('/uploads/login-bg.png.png'),
    fallbackImage: DEFAULT_IMAGE_DATA_URI,
    // 推荐非遗项目列表（从后端获取）
    recommendList: [],
    newsLoading: true,
    newsLoadError: false
  },

  onLogoError() {
    this.setData({ logoUrl: this.data.fallbackImage });
  },

  onBannerImageError(e) {
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    this.setData({
      [`bannerList[${index}].image`]: this.data.fallbackImage
    });
  },

  onNewsImageError(e) {
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    this.setData({
      [`displayNewsList[${index}].image`]: this.data.fallbackImage
    });
  },

  onRecommendImageError(e) {
    const index = e.currentTarget.dataset.index;
    if (index === undefined) return;
    this.setData({
      [`recommendList[${index}].image`]: this.data.fallbackImage
    });
  },

  onLoad: function () {
    // 加载新闻数据与推荐非遗项目
    this.loadBannerData();
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

  // 加载首页轮播图数据（从 banner 表获取）
  loadBannerData: function() {
    return request({
      url: '/banners'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取轮播图失败');
      }

      const list = Array.isArray(res.data) ? res.data : [];
      const bannerList = list.map(b => ({
        id: b.id,
        title: b.title,
        description: b.description,
        // 兼容后端可能返回的新闻关联字段
        newsId: b.newsId || b.news_id || null,
        image: b.imageUrl
          ? (b.imageUrl.startsWith('http') ? b.imageUrl : buildStaticUrl(b.imageUrl))
          : ''
      }));

      this.setData({ bannerList });
    }).catch(err => {
      console.error('获取轮播图失败:', err);
      wx.showToast({
        title: '加载轮播图失败',
        icon: 'none'
      });
    });
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadBannerData().catch(() => {}),
      this.loadNewsData().catch(() => {}),
      this.loadRecommendHeritage().catch(() => {})
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
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
    wx.showModal({
      title: '搜索新闻',
      editable: true,
      placeholderText: '输入关键词，例如：剪纸',
      success: (res) => {
        if (!res.confirm) {
          return;
        }
        const keyword = (res.content || '').trim();
        wx.navigateTo({
          url: `/pages/newsList/newsList?keyword=${encodeURIComponent(keyword)}`
        });
      }
    });
  },
  
  // 加载新闻数据（多取若干条供轮播标题匹配，卡片仅展示前几条）
  loadNewsData: function() {
    this.setData({ newsLoading: true, newsLoadError: false });
    return request({
      url: `/news/recent?page=0&size=${HOME_NEWS_FETCH_SIZE}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取新闻失败');
      }

      const { list: rawList } = normalizeNewsResponseData(res.data);
      const newsList = rawList.map(mapNewsItem);
      const displayNewsList = newsList.slice(0, HOME_NEWS_DISPLAY);

      this.setData({
        newsList,
        displayNewsList,
        newsLoading: false,
        newsLoadError: false
      });
    }).catch(err => {
      console.error('获取新闻失败:', err);
      this.setData({
        newsLoading: false,
        newsLoadError: true
      });
      wx.showToast({
        title: '加载新闻失败',
        icon: 'none'
      });
    });
  },

  // 加载推荐非遗项目（用于首页“推荐非遗项目”板块）
  loadRecommendHeritage: function() {
    return request({
      url: '/heritage/recommended'
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取推荐非遗项目失败');
      }
      const list = this.normalizeList(res.data);
      const recommendList = list.map(item => ({
        id: item.id,
        name: item.name,
        image: item.imageUrl && item.imageUrl.startsWith('http')
          ? item.imageUrl
          : buildStaticUrl(item.imageUrl || ''),
        region: item.region,
        category: item.category,
        level: item.level
      }));
      this.setData({
        recommendList
      });
    }).catch(err => {
      console.error('获取推荐非遗项目失败:', err);
      return request({
        url: '/heritage'
      }).then(allRes => {
        if (!allRes.success) {
          return;
        }
        const fallbackList = this.normalizeList(allRes.data).slice(0, 4);
        const recommendList = fallbackList.map(item => ({
          id: item.id,
          name: item.name,
          image: item.imageUrl && item.imageUrl.startsWith('http')
            ? item.imageUrl
            : buildStaticUrl(item.imageUrl || ''),
          region: item.region,
          category: item.category,
          level: item.level
        }));
        this.setData({ recommendList });
      }).catch(() => {});
    });
  },

  // 通知功能
  onNotification: function() {
    request({
      url: '/home/notifications'
    }).then(res => {
      const data = res && res.data
      const notifications = Array.isArray(data)
        ? data
        : (data && Array.isArray(data.list) ? data.list : [])
      if (!res.success || notifications.length === 0) {
        wx.showToast({ title: '暂无新通知', icon: 'none' });
        return;
      }
      const latest = notifications[0];
      wx.showModal({
        title: latest.title || '系统通知',
        content: latest.content || '暂无内容',
        showCancel: false
      });
    }).catch((err) => {
      wx.showToast({
        title: requestErrorMessage(err),
        icon: 'none'
      });
    });
  },

  // 新闻点击
  onNewsTap: function(e) {
    const item = e.currentTarget.dataset.item
    // 与轮播图点击保持一致：跳转到新闻详情页面
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${item.id}`
    })
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
    if (!item) {
      return;
    }

    // 1) 优先使用 banner 自带的新闻关联 id
    if (item.newsId) {
      wx.navigateTo({
        url: `/pages/newsDetail/newsDetail?id=${item.newsId}`
      });
      return;
    }

    // 2) 无关联 id 时，尝试按标题在已加载新闻中匹配
    const matchedNews = (this.data.newsList || []).find(news => news.title === item.title);
    if (matchedNews && matchedNews.id) {
      wx.navigateTo({
        url: `/pages/newsDetail/newsDetail?id=${matchedNews.id}`
      });
      return;
    }

    // 3) 兜底：带标题关键词跳到新闻列表，用户可直接看到相关内容
    wx.navigateTo({
      url: `/pages/newsList/newsList?keyword=${encodeURIComponent(item.title || '')}`
    });
  },

  // 跳转到AR体验页面
  navigateToARExperience: function() {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  },

  /** 推荐路径：首页 → 新闻列表 → 详情（由列表内再点） */
  goFlowNews: function () {
    wx.navigateTo({
      url: '/pages/newsList/newsList'
    })
  },

  /** 推荐路径：首页 → 非遗名录（Heritage 非 Tab，须 navigateTo） */
  goFlowHeritage: function () {
    wx.navigateTo({
      url: '/pages/Heritage/Heritage'
    })
  },

  /** 推荐路径：首页 → 非遗详情（单步） */
  goFlowDetailDirect: function () {
    const first = (this.data.recommendList || [])[0]
    if (first && first.id) {
      wx.navigateTo({
        url: `/pages/heritageDetail/heritageDetail?id=${first.id}`
      })
      return
    }

    // 推荐列表尚未就绪时兜底到接口首条，避免硬编码 id。
    request({ url: '/heritage/recommended' })
      .then((res) => {
        const list = this.normalizeList(res && res.data)
        const firstItem = list[0]
        if (!firstItem || !firstItem.id) {
          throw new Error('暂无可用的推荐非遗项目')
        }
        wx.navigateTo({
          url: `/pages/heritageDetail/heritageDetail?id=${firstItem.id}`
        })
      })
      .catch((err) => {
        wx.showToast({
          title: requestErrorMessage(err),
          icon: 'none'
        })
      })
  },

  /** 推荐路径：首页 → AR Tab（再在 AR 页点项目进相机页） */
  goFlowAR: function () {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  },

  goActivity: function () {
    wx.navigateTo({
      url: '/pages/activityList/activityList'
    })
  },

  /** 二级页：新闻列表 */
  goNewsList: function () {
    wx.navigateTo({ url: '/pages/newsList/newsList' })
  },

  /** 二级页：新闻详情（示例 id） */
  goNewsDetailDemo: function () {
    wx.navigateTo({ url: '/pages/newsDetail/newsDetail?id=1' })
  },

  /** 二级页：国家级非遗列表 */
  goNational: function () {
    wx.navigateTo({
      url: '/pages/nationalHeritageList/nationalHeritageList?category=all'
    })
  },

  /** 二级页：省级非遗列表 */
  goProvincial: function () {
    wx.navigateTo({
      url: '/pages/provincialHeritageList/provincialHeritageList?category=all'
    })
  },

  /** 二级页：收藏列表 */
  goCollection: function () {
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看我的收藏',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }
    wx.navigateTo({ url: '/pages/collectionList/collectionList' })
  },

  /** 二级页：预约列表 */
  goBooking: function () {
    if (!isLoggedIn()) {
      wx.showModal({
        title: '提示',
        content: '请先登录后查看我的预约',
        showCancel: true,
        cancelText: '取消',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      return
    }
    wx.navigateTo({ url: '/pages/bookingList/bookingList' })
  },

  /** 二级页：技艺视频列表 */
  goSkillVideo: function () {
    wx.navigateTo({ url: '/pages/skillVideoList/skillVideoList' })
  },

  /** 二级页：传承人名录 */
  goMasterList: function () {
    wx.navigateTo({ url: '/pages/masterList/masterList' })
  },

  /** Tab：个人中心 */
  goPersonal: function () {
    wx.switchTab({ url: '/pages/PersonalCenter/PersonalCenter' })
  }
})