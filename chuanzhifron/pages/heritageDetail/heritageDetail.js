import { request } from '../../utils/util.js'

Page({
  data: {
    heritageDetail: {},
    imageUrl: '',
    descriptionParagraphs: [],
    levelText: '',
    categoryText: ''
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
    this.loadHeritageDetail(id)
  },

  // 加载非遗项目详情（图文内容从后端获取）
  loadHeritageDetail(id) {
    request({
      url: `/heritage/detail/${id}`
    }).then(res => {
      if (!res.success) {
        throw new Error(res.message || '获取非遗详情失败')
      }

      const data = res.data || {}

      // 处理图片：后端存的是相对路径，前面补服务器地址
      let imageUrl = ''
      if (data.imageUrl) {
        imageUrl = data.imageUrl.startsWith('http')
          ? data.imageUrl
          : 'http://localhost:8001' + data.imageUrl
      } else {
        // 按你的说明使用 heritage_index 中的图片，书法、中医药等可以根据名称简单映射
        const name = (data.name || '').trim()
        if (name.includes('书法')) {
          imageUrl = 'http://localhost:8001/uploads/heritage_index/recommend_heritage_shufa.jpg'
        } else if (name.includes('刺绣')) {
          imageUrl = 'http://localhost:8001/uploads/heritage_index/recommend_heritage_cixiu.jpg'
        } else if (name.includes('中医') || name.includes('中医药')) {
          imageUrl = 'http://localhost:8001/uploads/heritage_index/recommend_heritage_zhongyiyao.jpg'
        } else if (name.includes('武术')) {
          imageUrl = 'http://localhost:8001/uploads/heritage_index/recommend_heritage_wushu.jpg'
        } else {
          imageUrl = 'http://localhost:8001/uploads/heritage_index/recommend_heritage_shufa.jpg'
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
        categoryText
      })
    }).catch(err => {
      console.error('获取非遗详情失败:', err)
      wx.showToast({
        title: '加载详情失败',
        icon: 'none'
      })
    })
  },

  // 根据项目名称生成一段富有文化感的介绍性文字（自由发挥）
  buildExtraIntro(data) {
    const name = (data.name || '该非遗项目').trim()
    const region = data.region || '中国各地'

    // 这里是你要求“自由发挥”的文字内容，可以被 Heritage 页面复用
    return [
      `${name} 是扎根于 ${region} 的重要非物质文化遗产，它承载着当地人民的生活记忆与审美传统。`,
      `在漫长的历史发展过程中，${name} 逐渐形成了独特的技法体系与审美风格，不仅体现在作品的外在形态上，更体现在技艺背后的文化精神与价值观念中。`,
      `今天，越来越多的年轻人通过课程体验、数字化展示等形式走近 ${name}，在学习传统技艺的过程中，重新发现手作的温度与时间的价值，也让这项古老技艺在当代社会焕发出新的生命力。`
    ].join('\n')
  }
})


