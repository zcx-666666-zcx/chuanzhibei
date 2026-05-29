const { request, requestErrorMessage } = require('../utils/util.js')
const { buildStaticUrl } = require('../utils/config.js')
const { normalizeNewsResponseData, mapNewsItem } = require('../utils/newsDisplay.js')
const { isLoggedIn } = require('../utils/auth.js')
const { checkMyCollection } = require('./profile.service.js')

const CATEGORY_MAP = {
  craft: '传统技艺',
  art: '传统美术',
  music: '传统音乐',
  dance: '传统舞蹈',
  drama: '传统戏剧',
  medicine: '传统医药',
  folklore: '民俗'
}

const HERITAGE_FALLBACK_IMAGE = '/uploads/photo_ARExperience.png'

function resolveStaticUrl(url, fallback) {
  if (!url) {
    return fallback || ''
  }
  return /^https?:\/\//.test(url) ? url : buildStaticUrl(url)
}

function buildHeritageExtraIntro(data) {
  const name = (data.name || '该非遗项目').trim()
  const region = data.region || '中国各地'
  return [
    `${name} 是扎根于 ${region} 的重要非物质文化遗产，它承载着当地人民的生活记忆与审美传统。`,
    `在漫长的历史发展过程中，${name} 逐渐形成了独特的技法体系与审美风格，不仅体现在作品的外在形态上，更体现在技艺背后的文化精神与价值观念中。`,
    `今天，越来越多的年轻人通过课程体验、数字化展示等形式走近 ${name}，在学习传统技艺的过程中，重新发现手作的温度与时间的价值，也让这项古老技艺在当代社会焕发出新的生命力。`
  ].join('\n')
}

function loadNewsList(params) {
  const keyword = (params.keyword || '').trim()
  const page = params.page || 0
  const pageSize = params.pageSize || 10
  const url = keyword
    ? `/news/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${pageSize}`
    : `/news/recent?page=${page}&size=${pageSize}`

  return request({ url })
    .then((res) => {
      if (!res.success) {
        throw new Error(res.message || '获取新闻失败')
      }
      const payload = normalizeNewsResponseData(res.data)
      return {
        list: payload.list.map(mapNewsItem),
        total: payload.total,
        page: payload.page,
        hasMore: payload.hasMore
      }
    })
    .catch((err) => {
      throw new Error(requestErrorMessage(err))
    })
}

function loadNewsDetail(id) {
  return request({
    url: `/news/${id}`
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取新闻详情失败')
    }
    const data = res.data
    if (!data) {
      throw new Error('未获取到新闻数据')
    }

    const imageList = data.imageUrls
      ? data.imageUrls.split(',').map((url) => resolveStaticUrl(url.trim()))
      : [buildStaticUrl(`/uploads/news_index/news_${id}.jpg`)]

    const contentParagraphs = data.content
      ? data.content.split('\n').map((p) => p.trim()).filter(Boolean)
      : []

    return {
      newsDetail: Object.assign({}, data, {
        publishTime: formatPublishTime(data.publishTime),
        author: data.author || '非遗文化编辑部'
      }),
      imageList,
      contentParagraphs
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function loadHeritageDetail(id) {
  return request({
    url: `/heritage/detail/${id}`
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取非遗详情失败')
    }
    const data = res.data || {}
    if (!data.id) {
      throw new Error('非遗项目不存在')
    }

    const fallbackImage = buildStaticUrl('/uploads/photo_ARExperience.png')
    const imageUrl = resolveStaticUrl(data.imageUrl, fallbackImage)
    const desc = (data.description || '').trim()
    const extraIntro = buildHeritageExtraIntro(data)
    const merged = (desc ? `${desc}\n\n` : '') + extraIntro
    const descriptionParagraphs = merged.split('\n').map((p) => p.trim()).filter(Boolean)

    return {
      heritageDetail: data,
      imageUrl,
      descriptionParagraphs,
      levelText: resolveHeritageLevelText(data.level),
      categoryText: CATEGORY_MAP[data.category] || '非遗门类'
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function mapHeritageItem(item) {
  const fallbackImage = buildStaticUrl(HERITAGE_FALLBACK_IMAGE)
  return Object.assign({}, item, {
    image: resolveStaticUrl(item.image || item.imageUrl, fallbackImage),
    imageUrl: resolveStaticUrl(item.imageUrl || item.image, fallbackImage),
    description: item.description || '暂无简介',
    region: item.region || '地区待补充',
    isFavorite: Boolean(item.isFavorite)
  })
}

function filterHeritageList(list, options) {
  const level = options && options.level
  const category = (options && options.category) || 'all'

  return (Array.isArray(list) ? list : []).filter((item) => {
    if (level && Number(item.level) !== Number(level)) {
      return false
    }
    if (category !== 'all' && item.category !== category) {
      return false
    }
    return true
  })
}

function decorateHeritageFavorites(list) {
  const source = Array.isArray(list) ? list : []
  if (!isLoggedIn() || source.length === 0) {
    return Promise.resolve(source.map((item) => Object.assign({}, item, { isFavorite: false })))
  }

  return Promise.all(
    source.map((item) =>
      checkMyCollection(item.id).catch(() => false)
    )
  ).then((flags) =>
    source.map((item, index) =>
      Object.assign({}, item, {
        isFavorite: Boolean(flags[index])
      })
    )
  )
}

function loadHeritageCatalog(options) {
  const opts = options || {}
  return request({
    url: '/heritage'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取非遗数据失败')
    }
    const data = Array.isArray(res.data) ? res.data : []
    return data.map(mapHeritageItem)
  }).then((list) => {
    const filtered = filterHeritageList(list, opts)
    if (!opts.includeFavorite) {
      return filtered
    }
    return decorateHeritageFavorites(filtered)
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function buildHeritageSections(list, options) {
  const opts = options || {}
  const limitPerLevel = opts.limitPerLevel || 4
  const filtered = filterHeritageList(list, {
    category: opts.category || 'all'
  })
  const nationalList = filtered.filter((item) => Number(item.level) === 1)
  const provincialList = filtered.filter((item) => Number(item.level) === 2)

  return {
    nationalList,
    provincialList,
    displayNationalList: nationalList.slice(0, limitPerLevel),
    displayProvincialList: provincialList.slice(0, limitPerLevel)
  }
}

function loadCollectionFallbackDetail(collectionData) {
  const fallbackImage = buildStaticUrl('/uploads/photo_ARExperience.png')
  const imageUrl = resolveStaticUrl(collectionData.imageUrl || '', fallbackImage)
  const description = (collectionData.description || '').trim()

  return {
    heritageDetail: {
      name: collectionData.name || '未知项目',
      description: collectionData.description || '',
      level: collectionData.level || ''
    },
    imageUrl,
    descriptionParagraphs: description
      ? description.split('\n').map((p) => p.trim()).filter(Boolean)
      : ['该非遗项目的详细信息暂不可用。'],
    levelText: collectionData.level || '非物质文化遗产项目',
    categoryText: '非遗门类'
  }
}

function getDefaultSkillVideos() {
  return [
    {
      id: 1,
      title: '苏绣技艺展示',
      description: '国家级传承人姚建萍展示苏绣的精湛技艺和独特魅力，详细介绍平针、套针等传统针法',
      thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_suxiu.jpg'),
      videoUrl: buildStaticUrl('/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4'),
      duration: '15:30',
      date: '2024-05-15',
      views: '3.2万'
    },
    {
      id: 2,
      title: '景泰蓝制作工艺',
      description: '工艺美术大师张同禄现场呈现景泰蓝的掐丝、点蓝、烧制等关键工艺流程',
      thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingtai.jpg'),
      videoUrl: buildStaticUrl('/uploads/video_ARExperinece/景德镇青花瓷.mp4'),
      duration: '18:45',
      date: '2024-05-12',
      views: '2.8万'
    },
    {
      id: 3,
      title: '剪纸艺术创作',
      description: '传承人高凤莲展示传统剪纸技法，从设计到剪裁，展现剪纸艺术的精妙',
      thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jianzhi.jpg'),
      videoUrl: buildStaticUrl('/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4'),
      duration: '12:20',
      date: '2024-05-10',
      views: '1.9万'
    },
    {
      id: 4,
      title: '京剧身段表演',
      description: '梅派传人展示京剧表演的身段、唱腔和舞台艺术，传承经典剧目',
      thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_jingjumei.jpg'),
      videoUrl: '',
      duration: '20:15',
      date: '2024-05-08',
      views: '4.5万'
    },
    {
      id: 5,
      title: '钧瓷烧制技艺',
      description: '钧瓷烧制技艺传承人展示传统钧瓷工艺，包括选料、成型、施釉、烧制等完整流程',
      thumbnail: buildStaticUrl('/uploads/masters_InheritorCommunit/master_junci.jpg'),
      videoUrl: buildStaticUrl('/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'),
      duration: '22:30',
      date: '2024-05-05',
      views: '2.1万'
    }
  ]
}

function loadSkillVideos() {
  return request({
    url: '/video/list'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取视频失败')
    }
    const list = res.data?.list || res.data || []
    return list.map((item) => ({
      ...item,
      thumbnail: resolveStaticUrl(item.thumbnail || ''),
      videoUrl: resolveStaticUrl(item.videoUrl || ''),
      views: item.views
        ? (item.views >= 10000 ? `${(item.views / 10000).toFixed(1)}万` : item.views)
        : '0'
    }))
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function getFallbackLearningChapters() {
  return [
    {
      id: 'chapter-1',
      title: '非遗入门导览',
      duration: '15分钟',
      type: 'guide',
      description: '先了解非遗定义、门类与保护体系。',
      path: '/pages/newsList/newsList',
      isFallback: true
    },
    {
      id: 'chapter-2',
      title: '名录与地域认知',
      duration: '20分钟',
      type: 'heritage',
      description: '通过名录认识地域差异与代表性项目。',
      path: '/pages/Heritage/Heritage',
      isFallback: true
    },
    {
      id: 'chapter-3',
      title: '技艺案例学习',
      duration: '25分钟',
      type: 'video',
      description: '观看技艺演示视频，理解工艺流程。',
      path: '/pages/skillVideoList/skillVideoList',
      isFallback: true
    },
    {
      id: 'chapter-4',
      title: '活动实践体验',
      duration: '20分钟',
      type: 'activity',
      description: '报名活动并进行线下互动体验。',
      path: '/pages/activityList/activityList',
      isFallback: true
    }
  ]
}

function loadLearningPath() {
  return request({
    url: '/learning/path'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取学习路径失败')
    }
    const chapters = Array.isArray(res.data) ? res.data : []
    return chapters.length > 0 ? chapters : getFallbackLearningChapters()
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function loadLearningProgress() {
  return request({
    url: '/learning/progress'
  }).then((res) => {
    if (!res.success || !res.data) {
      throw new Error(res.message || '获取学习进度失败')
    }
    const data = res.data
    return {
      progressPercent: Number(data.progressPercent || 0),
      completedCount: Number(data.completedCount || 0),
      totalChapters: Number(data.totalChapters || 0),
      completedChapterIds: Array.isArray(data.completedChapterIds) ? data.completedChapterIds : []
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function updateLearningProgress(payload) {
  return request({
    url: '/learning/progress',
    method: 'POST',
    data: payload
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '更新学习进度失败')
    }
    return true
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function loadInheritorDetail(id) {
  return request({
    url: `/inheritor/${id}`
  }).then((res) => {
    if (!res.success || !res.data) {
      throw new Error(res.message || '传承人不存在')
    }
    const item = res.data
    const avatar = item.avatar || item.imageUrl || ''
    return {
      ...item,
      avatar: resolveStaticUrl(avatar),
      introduction: item.introduction || item.description || '暂无介绍'
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function resolveHeritageLevelText(level) {
  if (level === 1) {
    return '国家级非遗项目'
  }
  if (level === 2) {
    return '省级非遗项目'
  }
  return '非物质文化遗产项目'
}

function formatPublishTime(publishTime) {
  if (!publishTime) {
    return '—'
  }
  if (typeof publishTime === 'object' && publishTime.year) {
    return `${publishTime.year}-${String(publishTime.monthValue).padStart(2, '0')}-${String(publishTime.dayOfMonth).padStart(2, '0')} ${String(publishTime.hour).padStart(2, '0')}:${String(publishTime.minute).padStart(2, '0')}:${String(publishTime.second).padStart(2, '0')}`
  }
  if (typeof publishTime === 'object' && Object.prototype.hasOwnProperty.call(publishTime, 'time')) {
    const date = new Date(publishTime.time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }
  return publishTime
}

module.exports = {
  buildHeritageSections,
  getDefaultSkillVideos,
  getFallbackLearningChapters,
  loadHeritageCatalog,
  loadCollectionFallbackDetail,
  loadHeritageDetail,
  loadInheritorDetail,
  loadLearningPath,
  loadLearningProgress,
  loadNewsDetail,
  loadNewsList,
  loadSkillVideos,
  resolveHeritageLevelText
  ,
  updateLearningProgress
}
