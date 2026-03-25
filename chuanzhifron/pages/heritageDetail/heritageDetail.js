import { request } from '../../utils/util.js'
import { getCurrentUser, isLoggedIn } from '../../utils/auth.js'
import { buildStaticUrl } from '../../utils/config.js'

Page({
  data: {
    heritageDetail: {},
    imageUrl: '',
    descriptionParagraphs: [],
    levelText: '',
    categoryText: '',
    isFavorite: false,
    heritageId: null,
    fromCollection: false,
    collectionData: null
  },

  onLoad(options) {
    const id = options.id
    if (!id) {
      wx.showToast({
        title: '未找到项目ID',
        icon: 'none'
      })
      return
    }
    
    // 检查是否从收藏页面跳转过来
    const fromCollection = options.fromCollection === 'true';
    let collectionData = null;
    if (fromCollection) {
      try {
        // 从临时存储中获取收藏数据
        collectionData = wx.getStorageSync('tempCollectionData');
        // 使用后清除临时数据
        if (collectionData) {
          wx.removeStorageSync('tempCollectionData');
        }
      } catch (e) {
        console.error('获取收藏数据失败:', e);
      }
    }
    
    this.setData({
      fromCollection: fromCollection,
      collectionData: collectionData
    });
    
    this.loadHeritageDetail(id)
  },

  // 加载非遗项目详情（图文内容从后端获取）
  loadHeritageDetail(id) {
    // 确保id是数字类型
    const heritageId = parseInt(id);
    if (!heritageId || isNaN(heritageId)) {
      wx.showModal({
        title: '错误',
        content: '非遗项目ID无效',
        showCancel: false,
        confirmText: '确定',
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    request({
      url: `/heritage/detail/${heritageId}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取非遗详情失败')
      }

      const data = res.data || {}
      
      // 如果数据为空，说明项目不存在
      if (!data || !data.id) {
        throw new Error('非遗项目不存在')
      }

      // 处理图片：后端存的是相对路径，前面补服务器地址
      let imageUrl = ''
      if (data.imageUrl) {
        imageUrl = data.imageUrl.startsWith('http')
          ? data.imageUrl
          : buildStaticUrl(data.imageUrl)
      } else {
        // 按你的说明使用 heritage_index 中的图片，书法、中医药等可以根据名称简单映射
        const name = (data.name || '').trim()
        if (name.includes('书法')) {
          imageUrl = buildStaticUrl('/uploads/heritage_index/recommend_heritage_shufa.jpg')
        } else if (name.includes('刺绣')) {
          imageUrl = buildStaticUrl('/uploads/heritage_index/recommend_heritage_cixiu.jpg')
        } else if (name.includes('中医') || name.includes('中医药')) {
          imageUrl = buildStaticUrl('/uploads/heritage_index/recommend_heritage_zhongyiyao.jpg')
        } else if (name.includes('武术')) {
          imageUrl = buildStaticUrl('/uploads/heritage_index/recommend_heritage_wushu.jpg')
        } else {
          imageUrl = buildStaticUrl('/uploads/heritage_index/recommend_heritage_shufa.jpg')
        }
      }

      // 处理文字内容：后端 description + 我帮你扩展的介绍性文案
      const desc = (data.description || '').trim()
      const extraIntro = this.buildExtraIntro(data)
      const merged = (desc ? desc + '\n\n' : '') + extraIntro
      const descriptionParagraphs = merged
        .split('\n')
        .map(p => p.trim())
        .filter(p => p)

      // 级别、类别展示文案
      const levelText = data.level === 1 ? '国家级非遗项目'
        : data.level === 2 ? '省级非遗项目'
        : '非物质文化遗产项目'

      const categoryMap = {
        craft: '传统技艺',
        art: '传统美术',
        music: '传统音乐',
        dance: '传统舞蹈',
        drama: '传统戏剧',
        medicine: '传统医药',
        folklore: '民俗'
      }
      const categoryText = categoryMap[data.category] || '非遗门类'

      this.setData({
        heritageDetail: data,
        imageUrl,
        descriptionParagraphs,
        levelText,
        categoryText,
        heritageId: data.id
      });
      
      // 检查是否已收藏
      this.checkFavoriteStatus(data.id);
    }).catch(err => {
      console.error('获取非遗详情失败:', err)
      const errorMsg = err.message || '加载详情失败';
      
      // 如果是从收藏页面跳转过来的，且项目不存在，使用收藏数据来显示
      if (this.data.fromCollection && this.data.collectionData && errorMsg.includes('不存在')) {
        this.loadFromCollectionData();
        return;
      }
      
      wx.showModal({
        title: '加载失败',
        content: errorMsg.includes('不存在') ? '该非遗项目不存在或已被删除' : errorMsg,
        showCancel: false,
        confirmText: '返回',
        success: () => {
          wx.navigateBack();
        }
      });
    })
  },

  // 从收藏数据加载详情（当非遗项目不存在时使用）
  loadFromCollectionData: function() {
    const collectionData = this.data.collectionData;
    if (!collectionData) {
      wx.showModal({
        title: '加载失败',
        content: '该非遗项目不存在或已被删除',
        showCancel: false,
        confirmText: '返回',
        success: () => {
          wx.navigateBack();
        }
      });
      return;
    }
    
    // 处理图片
    let imageUrl = collectionData.imageUrl || '';
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = buildStaticUrl(imageUrl);
    }
    if (!imageUrl) {
      // 使用默认图片
      imageUrl = buildStaticUrl('/uploads/heritage_index/recommend_heritage_shufa.jpg');
    }
    
    // 处理描述
    const desc = (collectionData.description || '').trim();
    const descriptionParagraphs = desc
      ? desc.split('\n').map(p => p.trim()).filter(p => p)
      : ['该非遗项目的详细信息暂不可用。'];
    
    // 处理级别
    const levelText = collectionData.level || '非物质文化遗产项目';
    
    this.setData({
      heritageDetail: {
        name: collectionData.name || '未知项目',
        description: collectionData.description || '',
        level: collectionData.level || ''
      },
      imageUrl: imageUrl,
      descriptionParagraphs: descriptionParagraphs,
      levelText: levelText,
      categoryText: '非遗门类',
      heritageId: this.data.heritageId,
      isFavorite: true // 从收藏来的，默认已收藏
    });
    
    wx.showToast({
      title: '提示：该项目可能已不存在',
      icon: 'none',
      duration: 2000
    });
  },

  // 根据项目名称生成一段富有文化感的介绍性文字（自由发挥）
  buildExtraIntro(data) {
    const name = (data.name || '该非遗项目').trim()
    const region = data.region || '中国各地'

    // 这里是你要求"自由发挥"的文字内容，可以被 Heritage 页面复用
    return [
      `${name} 是扎根于 ${region} 的重要非物质文化遗产，它承载着当地人民的生活记忆与审美传统。`,
      `在漫长的历史发展过程中，${name} 逐渐形成了独特的技法体系与审美风格，不仅体现在作品的外在形态上，更体现在技艺背后的文化精神与价值观念中。`,
      `今天，越来越多的年轻人通过课程体验、数字化展示等形式走近 ${name}，在学习传统技艺的过程中，重新发现手作的温度与时间的价值，也让这项古老技艺在当代社会焕发出新的生命力。`
    ].join('\n')
  },

  // 检查收藏状态
  checkFavoriteStatus: function(heritageId) {
    // 先检查是否登录
    if (!isLoggedIn()) {
      this.setData({
        isFavorite: false
      });
      return;
    }
    
    const user = getCurrentUser();
    if (!user) {
      this.setData({
        isFavorite: false
      });
      return;
    }
    
    // 获取用户ID
    const userId = user.id || user.userId;
    if (!userId) {
      this.setData({
        isFavorite: false
      });
      return;
    }
    
    request({
      url: `/user/collections/${userId}/check/${heritageId}`
    }).then(res => {
      if (res.success) {
        this.setData({
          isFavorite: res.data || false
        });
      } else {
        this.setData({
          isFavorite: false
        });
      }
    }).catch(err => {
      console.error('检查收藏状态失败:', err);
      this.setData({
        isFavorite: false
      });
    });
  },

  // 切换收藏状态
  toggleFavorite: function() {
    // 检查token
    const token = wx.getStorageSync('token');
    console.log('Token:', token);
    
    // 使用isLoggedIn检查登录状态
    if (!isLoggedIn() || !token) {
      console.log('未登录，token为空');
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
    console.log('用户信息:', user);
    console.log('用户信息类型:', typeof user);
    
    if (!user) {
      console.log('用户信息为空');
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
    
    // 获取用户ID - 尝试多种方式
    let userId = null;
    if (user && typeof user === 'object') {
      // 直接获取id（最常见的情况）
      userId = user.id;
      
      // 如果id不存在，尝试其他可能的字段名
      if (!userId) {
        userId = user.userId || user.user_id || user.ID;
      }
      
      // 如果还是不存在，尝试从嵌套对象中获取
      if (!userId && user.data && user.data.id) {
        userId = user.data.id;
      }
      if (!userId && user.user && user.user.id) {
        userId = user.user.id;
      }
    }
    
    console.log('最终获取到的用户ID:', userId);
    
    if (!userId) {
      console.error('无法获取用户ID');
      console.error('用户信息完整内容:', JSON.stringify(user, null, 2));
      console.error('用户信息类型:', typeof user);
      console.error('用户信息是否为对象:', user instanceof Object);
      
      wx.showModal({
        title: '提示',
        content: '无法获取用户ID，请重新登录。如果问题持续，请联系客服。',
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
    const { heritageId, heritageDetail, imageUrl, isFavorite } = this.data;
    
    if (isFavorite) {
      // 取消收藏
      request({
        url: `/user/collections/${userId}/heritage/${heritageId}`,
        method: 'DELETE'
      }).then(res => {
        if (res.success) {
          this.setData({
            isFavorite: false
          });
          
          wx.showToast({
            title: '已取消收藏',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: '取消收藏失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('取消收藏失败:', err);
        wx.showToast({
          title: err.message || '取消收藏失败，请重试',
          icon: 'none'
        });
      });
    } else {
      // 添加收藏
      const levelText = heritageDetail.level === 1 ? '国家级非遗项目'
        : heritageDetail.level === 2 ? '省级非遗项目'
        : '非物质文化遗产项目';
      
      const collectionData = {
        userId: userId,
        heritageId: heritageId,
        heritageName: heritageDetail.name,
        heritageDescription: heritageDetail.description || '',
        heritageLevel: levelText,
        imageUrl: imageUrl
      };
      
      request({
        url: '/user/collections',
        method: 'POST',
        data: collectionData
      }).then(res => {
        if (res.success) {
          this.setData({
            isFavorite: true
          });
          
          wx.showToast({
            title: '收藏成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.message || '收藏失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('收藏失败:', err);
        wx.showToast({
          title: err.message || '收藏失败，请重试',
          icon: 'none'
        });
      });
    }
  },

})


