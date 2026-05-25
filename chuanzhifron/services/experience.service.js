const { request, requestErrorMessage } = require('../utils/util.js')
const { getCurrentUser, isLoggedIn } = require('../utils/auth.js')
const { buildStaticUrl } = require('../utils/config.js')
const storage = require('../utils/storage.js')

const AR_PLACEHOLDER_IMAGE = buildStaticUrl('/uploads/photo_ARExperience.png')
const DEFAULT_AR_VIDEO_LIST = [
  '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
  '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
  '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
  '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
]
const FALLBACK_MASTER_IMAGES = [
  'master_jianzhi',
  'master_jingjumei',
  'master_jingtai',
  'master_junci',
  'master_suxiu'
]

function resolveStaticUrl(url, fallback) {
  if (!url) {
    return fallback || ''
  }
  return /^https?:\/\//.test(url) ? url : buildStaticUrl(url)
}

function ensureLoggedInUser() {
  const user = getCurrentUser()
  if (!isLoggedIn() || !user) {
    throw new Error('请先登录')
  }
  const userId = user.id || user.userId
  if (!userId) {
    throw new Error('无法获取用户信息')
  }
  return {
    user,
    userId
  }
}

function formatActivityCalendar(item) {
  let day = item.day
  let month = item.month
  if (item.time) {
    const dateMatch = String(item.time).match(/(\d{4})-(\d{2})-(\d{2})/)
    if (dateMatch) {
      const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      day = dateMatch[3]
      month = months[parseInt(dateMatch[2], 10) - 1] || `${dateMatch[2]}月`
    }
  }
  return {
    day: day || '15',
    month: month || '六月'
  }
}

function listActivities() {
  return request({
    url: '/activity/list'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取活动列表失败')
    }
    const list = res.data?.list || res.data || []
    return list.map((item) => {
      const calendar = formatActivityCalendar(item)
      const buttonText = item.buttonText || (item.capacity > 0 && item.participants >= item.capacity ? '已满员' : '报名参加')
      return {
        ...item,
        day: calendar.day,
        month: calendar.month,
        buttonText
      }
    })
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function createBooking(payload) {
  const { userId } = ensureLoggedInUser()
  const bookingRequest = {
    userId,
    type: payload.type,
    status: payload.status || 'pending',
    time: payload.time || '待确认',
    location: payload.location || '待确认',
    contact: payload.contact || '待确认'
  }

  if (payload.type === 'experience') {
    bookingRequest.masterId = payload.masterId
    bookingRequest.masterName = payload.masterName
    bookingRequest.skill = payload.skill
    bookingRequest.masterAvatar = payload.masterAvatar || ''
  } else if (payload.type === 'activity' || payload.type === 'watch') {
    bookingRequest.activityId = payload.activityId
    bookingRequest.activityTitle = payload.activityTitle
  }

  return request({
    url: '/user/bookings',
    method: 'POST',
    data: bookingRequest
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '保存预约失败')
    }
    return res.data || true
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function joinActivity(activity) {
  const bookingType = activity.buttonText === '报名参加' ? 'activity' : 'watch'
  return request({
    url: '/activity/join',
    method: 'POST',
    data: {
      activityId: activity.id
    }
  }).then((response) => {
    if (!response || !response.success) {
      throw new Error(response?.message || '报名失败')
    }
    return createBooking({
      type: bookingType,
      activityId: activity.id,
      activityTitle: activity.title,
      time: activity.time || '待确认',
      location: activity.location || '待确认',
      description: activity.description || '',
      status: 'pending'
    })
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function formatBookingTime() {
  const now = new Date()
  const daysLater = Math.floor(Math.random() * 7) + 7
  const bookingDate = new Date(now.getTime() + daysLater * 24 * 60 * 60 * 1000)
  const year = bookingDate.getFullYear()
  const month = String(bookingDate.getMonth() + 1).padStart(2, '0')
  const day = String(bookingDate.getDate()).padStart(2, '0')
  const timeSlots = ['10:00-12:00', '14:00-16:00', '15:00-17:00']
  const timeSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)]
  return `${year}-${month}-${day} ${timeSlot}`
}

function bookMasterExperience(master) {
  return createBooking({
    type: 'experience',
    masterId: master.id,
    masterName: master.name,
    skill: master.skill,
    masterAvatar: master.avatar || master.image || '',
    time: formatBookingTime(),
    location: '待确认',
    status: 'pending'
  })
}

function getFavoriteMasterIds() {
  const ids = storage.get(storage.KEYS.favoriteMasterIds, [])
  return Array.isArray(ids) ? ids.map((n) => Number(n)).filter(Boolean) : []
}

function setFavoriteMasterIds(ids) {
  return storage.set(storage.KEYS.favoriteMasterIds, ids)
}

function resolveMasterCategory(skill) {
  if (String(skill).includes('苏绣')) return 'suxiu'
  if (String(skill).includes('景泰蓝')) return 'jingtai'
  if (String(skill).includes('剪纸')) return 'jianzhi'
  if (String(skill).includes('京剧')) return 'jingju'
  if (String(skill).includes('钧瓷')) return 'junci'
  return 'all'
}

function getDefaultMasters() {
  const baseUrl = buildStaticUrl('/uploads/masters_InheritorCommunit/')
  return [
    {
      id: 1,
      name: '张同禄',
      skill: '景泰蓝制作技艺',
      title: '中国工艺美术大师',
      introduction: '景泰蓝制作技艺国家级传承人，从业50余年，擅长掐丝珐琅工艺，作品多次获得国内外大奖。',
      avatar: `${baseUrl}master_jingtai.jpg`,
      isFavorite: false,
      category: 'jingtai'
    },
    {
      id: 2,
      name: '姚建萍',
      skill: '苏绣',
      title: '江苏省工艺美术大师',
      introduction: '苏绣技艺传承人，创新了多种刺绣技法，将传统苏绣与现代艺术相结合，作品风格独特。',
      avatar: `${baseUrl}master_suxiu.jpg`,
      isFavorite: false,
      category: 'suxiu'
    },
    {
      id: 3,
      name: '高凤莲',
      skill: '剪纸',
      title: '国家级传承人',
      introduction: '陕北剪纸艺术传承人，擅长传统民间剪纸技艺，作品充满浓厚的乡土气息和民族特色。',
      avatar: `${baseUrl}master_jianzhi.jpg`,
      isFavorite: false,
      category: 'jianzhi'
    },
    {
      id: 4,
      name: '梅葆玖',
      skill: '京剧',
      title: '京剧表演艺术家',
      introduction: '京剧大师梅兰芳之子，继承并发扬梅派艺术，在京剧表演和传承方面做出卓越贡献。',
      avatar: `${baseUrl}master_jingjumei.jpg`,
      isFavorite: false,
      category: 'jingju'
    },
    {
      id: 5,
      name: '孔相卿',
      skill: '钧瓷烧制技艺',
      title: '中国工艺美术大师',
      introduction: '钧瓷烧制技艺传承人，在传统钧瓷工艺基础上不断创新，作品具有很高的艺术价值和收藏价值。',
      avatar: `${baseUrl}master_junci.jpg`,
      isFavorite: false,
      category: 'junci'
    }
  ]
}

function listMasters() {
  const favoriteIds = getFavoriteMasterIds()
  return request({
    url: '/inheritor/list'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取传承人失败')
    }
    const list = res.data?.list || res.data || []
    const mapped = list.map((item, index) => {
      let avatar = ''
      if (item.avatar || item.imageUrl) {
        avatar = resolveStaticUrl(item.avatar || item.imageUrl)
      } else {
        const imgName = FALLBACK_MASTER_IMAGES[index % FALLBACK_MASTER_IMAGES.length]
        avatar = buildStaticUrl(`/uploads/masters_InheritorCommunit/${imgName}.jpg`)
      }
      return {
        ...item,
        avatar,
        introduction: item.introduction || item.description || '暂无介绍',
        skill: item.skill || '传统技艺',
        title: item.title || '国家级传承人',
        isFavorite: favoriteIds.includes(Number(item.id)),
        category: resolveMasterCategory(item.skill || '传统技艺')
      }
    })
    return mapped.length > 0 ? mapped : getDefaultMasters().map((item) => ({
      ...item,
      isFavorite: favoriteIds.includes(Number(item.id))
    }))
  }).catch((err) => {
    if (err && err.message) {
      throw new Error(requestErrorMessage(err))
    }
    throw err
  })
}

function mapArProject(item, index, overrideVideoUrl) {
  const rawVideoPath = overrideVideoUrl || item.videoUrl || DEFAULT_AR_VIDEO_LIST[index] || ''
  const cover = resolveStaticUrl(item.coverImage, AR_PLACEHOLDER_IMAGE)
  return {
    ...item,
    coverImage: cover,
    markerImage: resolveStaticUrl(item.markerImage, cover),
    videoUrl: resolveStaticUrl(rawVideoPath),
    description: item.description || '暂无介绍'
  }
}

function listArProjects() {
  return request({
    url: '/ar/projects',
    data: {
      page: 1,
      size: 100
    }
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取AR项目失败')
    }
    const list = res.data?.list || res.data || []
    return list.map((item, index) => mapArProject(item, index))
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function getArProjectDetail(id, overrideVideoUrl) {
  return request({
    url: `/ar/projects/${id}`
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取项目失败')
    }
    const data = res.data || {}
    const mapped = mapArProject(data, Number(id) - 1, overrideVideoUrl)
    return {
      project: mapped,
      instructionLines: String(data.instruction || '').split('\n').filter((line) => line.trim())
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function formatArTime(val) {
  if (!val) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'object') {
    const y = val.year || ''
    const m = val.monthValue ? String(val.monthValue).padStart(2, '0') : ''
    const d = val.dayOfMonth ? String(val.dayOfMonth).padStart(2, '0') : ''
    const hh = val.hour != null ? String(val.hour).padStart(2, '0') : '00'
    const mm = val.minute != null ? String(val.minute).padStart(2, '0') : '00'
    return `${y}-${m}-${d} ${hh}:${mm}`
  }
  return ''
}

function mapArHistoryItem(item, videoUrl) {
  return {
    id: item.id,
    projectId: item.projectId,
    name: item.projectName,
    image: resolveStaticUrl(item.projectThumb, AR_PLACEHOLDER_IMAGE),
    videoUrl: videoUrl || '',
    time: formatArTime(item.startTime),
    duration: item.duration ? `${Math.round(item.duration / 60)}分钟` : '—'
  }
}

function listArHistory(projects) {
  if (!isLoggedIn()) {
    return Promise.resolve([])
  }
  try {
    ensureLoggedInUser()
  } catch (_err) {
    return Promise.resolve([])
  }

  const projectMap = new Map((projects || []).map((item) => [String(item.id), item.videoUrl || '']))

  return request({
    url: '/ar/history?page=1&size=100'
  }).then((res) => {
    const allList = res.data?.list || []
    const trimList = () => allList.slice(0, 4).map((item) => mapArHistoryItem(item, projectMap.get(String(item.projectId))))

    if (allList.length > 4) {
      return request({
        url: '/ar/history/cleanup?keepCount=4',
        method: 'DELETE'
      }).catch(() => null).then(() => trimList())
    }

    return trimList()
  }).catch(() => [])
}

function saveArHistory(projectId, duration) {
  if (!isLoggedIn()) {
    return Promise.resolve(false)
  }
  try {
    ensureLoggedInUser()
  } catch (_err) {
    return Promise.resolve(false)
  }
  return request({
    url: '/ar/history',
    method: 'POST',
    data: {
      projectId,
      duration
    }
  }).then(() => true).catch(() => false)
}

module.exports = {
  AR_PLACEHOLDER_IMAGE,
  bookMasterExperience,
  createBooking,
  formatArTime,
  formatBookingTime,
  getArProjectDetail,
  getDefaultMasters,
  getFavoriteMasterIds,
  joinActivity,
  listActivities,
  listArHistory,
  listArProjects,
  listMasters,
  saveArHistory,
  setFavoriteMasterIds
}
