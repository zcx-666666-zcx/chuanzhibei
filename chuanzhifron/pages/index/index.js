// index.js
const app = getApp()
// NOTE: utils/config.js 和 utils/util.js 使用的是 CommonJS 的 module.exports，
// 在小程序端用 require 引入更稳，避免 import 的命名导出兼容性问题。
const { request } = require('../../utils/util.js')
const { buildStaticUrl, DEFAULT_IMAGE_DATA_URI } = require('../../utils/config.js')

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
    loading: true
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
    request({
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
  
  // 加载新闻数据
  loadNewsData: function() {
    request({
      url: '/news/recent'
    }).then(res => {
      // 与后端 Result<T> 结构对齐：{ success, message, data }
      if (!res.success) {
        throw new Error(res.message || '获取新闻失败');
      }

      const list = this.normalizeList(res.data);

      // 处理新闻数据：补充图片与日期字段，并增加收藏状态
      const newsList = list.map(item => {
        // 处理封面图：取 imageUrls 中第一张，没有则按 id 兜底
        let image = '';
        if (item.imageUrls) {
          const first = item.imageUrls.split(',')[0].trim();
          image = first.startsWith('http')
            ? first
            : buildStaticUrl(first);
        } else if (item.id != null) {
          image = buildStaticUrl(`/uploads/news_index/news_${item.id}.jpg`);
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
      
      // 首页只显示前3条新闻
      const displayNewsList = newsList.slice(0, 3);
      
      this.setData({
        newsList,
        displayNewsList,
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
      // 后端推荐接口异常时，回退到全量接口，保障首页稳定
      request({
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
      if (!res.success || !(res.data || []).length) {
        wx.showToast({ title: '暂无新通知', icon: 'none' });
        return;
      }
      const latest = res.data[0];
      wx.showModal({
        title: latest.title || '系统通知',
        content: latest.content || '暂无内容',
        showCancel: false
      });
    }).catch(() => {
      wx.showToast({
        title: '获取通知失败',
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

  /** 推荐路径：首页 → Tab「探索」 */
  goFlowHeritage: function () {
    wx.switchTab({
      url: '/pages/Heritage/Heritage'
    })
  },

  /** 推荐路径：首页 → 非遗详情（单步） */
  goFlowDetailDirect: function () {
    wx.navigateTo({
      url: '/pages/heritageDetail/heritageDetail?id=1'
    })
  },

  /** 推荐路径：首页 → AR Tab（再在 AR 页点项目进相机页） */
  goFlowAR: function () {
    wx.switchTab({
      url: '/pages/ARExperience/ARExperience'
    })
  },

  goCommunity: function () {
    wx.navigateTo({
      url: '/pages/InheritorCommunity/InheritorCommunity'
    })
  },

  goLearning: function () {
    wx.navigateTo({
      url: '/pages/learning/learning'
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

  /** 二级页：AR 项目列表（全量项目） */
  goARProjectList: function () {
    wx.navigateTo({ url: '/pages/ARProjectList/ARProjectList' })
  },

  /** 二级页：收藏列表 */
  goCollection: function () {
    wx.navigateTo({ url: '/pages/collectionList/collectionList' })
  },

  /** 二级页：预约列表 */
  goBooking: function () {
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