/**
 * 前端本地数据适配层：在未接入真实后端时，拦截 request 并返回内置数据。
 * 收藏与预约等写操作使用内存 / 本地状态模拟，保障整体流程完整可体验。
 */
const { buildStaticUrl } = require('./config.js')

/**
 * 统一使用本地 uploads 资源，避免 mock 数据依赖外链导致审核/离线演示不稳定。
 * 不同 seed 轮换不同占位图，保持页面视觉差异。
 */
const MOCK_PLACEHOLDERS = [
  '/uploads/photo_ARExperience.png',
  '/uploads/photo_ARExperinece/deomphoto.jpg',
  '/uploads/login-bg.png.png'
]
const hashSeed = (seed) => String(seed || '').split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
const PIC = (seed) => {
  const idx = hashSeed(seed) % MOCK_PLACEHOLDERS.length
  return buildStaticUrl(MOCK_PLACEHOLDERS[idx])
}

const mockFavoriteIds = new Set([1, 4])
let mockBookingSeq = 100

const NEWS = [
  {
    id: 1,
    title: '数字非遗：当传统技艺遇见元宇宙展厅',
    description: '多地非遗馆上线沉浸式数字展陈，观众可云端走近传承人工作台。',
    imageUrls: `${PIC('news1')}`,
    content: '展览以「可触摸的时间」为主题，通过高清影像与交互叙事，将刺绣、陶瓷、木作等门类的工序拆解为可理解的视觉语言。\n\n观众在小程序端即可完成展线导览，并预约线下深度体验。',
    publishTime: '2026-03-18 09:30:00'
  },
  {
    id: 2,
    title: '青年传承人计划：让老手艺有新观众',
    description: '面向全国高校招募非遗传播志愿者，用短视频记录技艺之美。',
    imageUrls: `${PIC('news2')}`,
    content: '项目强调「记录即传承」，提供脚本培训与拍摄支持，优秀作品将入选官方非遗影像库。\n\n参赛者可通过本小程序专题页报名，并跟踪评审进度。',
    publishTime: '2026-03-12 14:00:00'
  },
  {
    id: 3,
    title: '节气与民俗：清明前后的纸鸢与茶事',
    description: '江南一带仍保留扎鸢、踏青、雨前茶等节令活动，与非遗名录紧密相连。',
    imageUrls: `${PIC('news3')}`,
    content: '文章梳理了纸鸢扎制、绿茶炒制等项目的文化语境，并给出非遗地图上的体验点位建议。\n\n欢迎读者在「探索」页按地区筛选，规划自己的文化微旅行。',
    publishTime: '2026-03-05 11:20:00'
  },
  {
    id: 4,
    title: '传统戏剧进校园：从身段到锣鼓经',
    description: '多所中小学引入京剧、昆曲工作坊，非遗传承从课间开始。',
    imageUrls: `${PIC('news4')}`,
    content: '课程由传承人驻校授课，配合小程序内的预习资料与身段图解，形成课内外闭环。\n\n家长可通过个人中心查看孩子参与的研学与预约记录。',
    publishTime: '2026-02-28 16:45:00'
  }
].map((n) => ({ ...n, author: n.author || '遗韵编辑' }))

const HERITAGE = [
  { id: 1, name: '苏绣', level: 1, category: 'craft', region: '江苏苏州', description: '以精细雅洁著称，针法灵动，设色秀雅。', imageUrl: PIC('h1') },
  { id: 2, name: '景泰蓝制作技艺', level: 1, category: 'craft', region: '北京', description: '铜胎掐丝珐琅，釉色富丽，工序繁复。', imageUrl: PIC('h2') },
  { id: 3, name: '京剧', level: 1, category: 'drama', region: '北京', description: '集唱念做打于一体，行当分工严谨。', imageUrl: PIC('h3') },
  { id: 4, name: '古琴艺术', level: 1, category: 'music', region: '全国', description: '音韵悠长，指法与减字谱承载千年乐思。', imageUrl: PIC('h4') },
  { id: 5, name: '少林功夫', level: 1, category: 'folklore', region: '河南登封', description: '禅武合一，套路与器械兼具观赏与修身。', imageUrl: PIC('h5') },
  { id: 6, name: '景德镇手工制瓷', level: 1, category: 'craft', region: '江西景德镇', description: '拉坯、利坯、画坯、施釉、烧制环环相扣。', imageUrl: PIC('h6') },
  { id: 7, name: '粤绣', level: 2, category: 'craft', region: '广东广州', description: '构图饱满，金银线垫绣富丽堂皇。', imageUrl: PIC('h7') },
  { id: 8, name: '蜀绣', level: 2, category: 'craft', region: '四川成都', description: '针法严谨，晕色柔和，擅长花鸟题材。', imageUrl: PIC('h8') },
  { id: 9, name: '木版年画', level: 2, category: 'art', region: '天津杨柳青', description: '构图吉祥，色彩对比鲜明，年节气息浓厚。', imageUrl: PIC('h9') },
  { id: 10, name: '昆曲', level: 2, category: 'drama', region: '江苏昆山', description: '水磨调细腻，身段程式化而富于诗意。', imageUrl: PIC('h10') },
  { id: 11, name: '藏医药', level: 2, category: 'medicine', region: '西藏', description: '理论体系完整，诊断与炮制技艺独特。', imageUrl: PIC('h11') },
  { id: 12, name: '傣族孔雀舞', level: 2, category: 'dance', region: '云南', description: '模仿孔雀形态，节奏与手势富有韵律。', imageUrl: PIC('h12') }
]

const AR_VIDEOS = [
  '/uploads/video_ARExperinece/苏绣双面绣AR体验视频.mp4',
  '/uploads/video_ARExperinece/青铜器纹样AR体验视频.mp4',
  '/uploads/video_ARExperinece/景德镇青花瓷.mp4',
  '/uploads/video_ARExperinece/少林武术AR体验视频生成.mp4'
]

const AR_PROJECTS = [
  { id: 1, name: '苏绣双面绣', coverImage: '/uploads/photo_ARExperinece/deomphoto.jpg', markerImage: '/uploads/photo_ARExperinece/deomphoto.jpg' },
  { id: 2, name: '青铜器纹样', coverImage: '/uploads/photo_ARExperinece/deomphoto.jpg', markerImage: '/uploads/photo_ARExperinece/deomphoto.jpg' },
  { id: 3, name: '景德镇青花瓷', coverImage: '/uploads/photo_ARExperinece/deomphoto.jpg', markerImage: '/uploads/photo_ARExperinece/deomphoto.jpg' },
  { id: 4, name: '少林武术', coverImage: '/uploads/photo_ARExperinece/deomphoto.jpg', markerImage: '/uploads/photo_ARExperinece/deomphoto.jpg' }
].map((item, index) => ({
  ...item,
  videoUrl: AR_VIDEOS[index] || AR_VIDEOS[0]
}))

const XR_MODELS = [
  {
    id: 'stone-stele',
    name: '古代石碑',
    modelUrl: '/uploads/3D/ancient-stone-stele.glb',
    coverImage: '/uploads/ar_index/ar_bronze1.jpg',
    source: 'mock'
  },
  {
    id: 'manuscript-cylinder',
    name: '古代经卷轴筒',
    modelUrl: '/uploads/3D/ancient-manuscript-cylinder.glb',
    coverImage: '/uploads/heritage_index/recommend_heritage_jingdezhenciqi.jpg',
    source: 'mock'
  },
  {
    id: 'cloisonne-vase',
    name: '景泰蓝花瓶',
    modelUrl: '/uploads/3D/cloisonne-vase.glb',
    coverImage: '/uploads/masters_InheritorCommunit/master_suxiu.jpg',
    source: 'mock'
  }
]

const BANNERS = [
  { id: 1, title: '遗韵 · 数字传承', description: '列表 → 详情 → 延伸体验，完整跳转链路一目了然', newsId: 1, imageUrl: PIC('ban1') },
  { id: 2, title: '探索非遗长卷', description: '按门类与级别筛选，走进国家级与省级名录', newsId: 2, imageUrl: PIC('ban2') },
  { id: 3, title: '沉浸 AR 体验', description: '从项目卡片进入相机界面，让文物在掌中徐徐展开', newsId: 3, imageUrl: PIC('ban3') }
]

const MASTERS = [
  { id: 1, name: '姚建萍', skill: '苏绣', title: '国家级代表性传承人', introduction: '致力于苏绣的当代转化与公共教育。', avatar: '', category: 'suxiu' },
  { id: 2, name: '张同禄', skill: '景泰蓝', title: '中国工艺美术大师', introduction: '景泰蓝技艺集大成者，作品屡获国家级奖项。', avatar: '', category: 'jingtai' },
  { id: 3, name: '梅葆玖', skill: '京剧', title: '梅派艺术传人', introduction: '继承梅派唱腔与身段，推动京剧进校园。', avatar: '', category: 'jingju' },
  { id: 4, name: '高凤莲', skill: '剪纸', title: '民间工艺美术大师', introduction: '陕北剪纸风格质朴有力，注重叙事性。', avatar: '', category: 'jianzhi' },
  { id: 5, name: '孔相卿', skill: '钧瓷烧制', title: '中国工艺美术大师', introduction: '钧瓷窑变釉色研究与现代器型探索。', avatar: '', category: 'junci' }
]

const VIDEOS = [
  { id: 1, title: '苏绣技艺展示', description: '平针、套针等经典针法分解呈现', thumbnail: PIC('v1'), duration: '15:30', date: '2026-02-10', views: 32000 },
  { id: 2, title: '景泰蓝制作工艺', description: '掐丝、点蓝、烧制关键工序', thumbnail: PIC('v2'), duration: '18:45', date: '2026-02-08', views: 28000 },
  { id: 3, title: '剪纸艺术创作', description: '从画稿到剪刻的全过程', thumbnail: PIC('v3'), duration: '12:20', date: '2026-02-05', views: 19000 },
  { id: 4, title: '京剧身段基础', description: '台步、圆场与手势组合入门', thumbnail: PIC('v4'), duration: '20:15', date: '2026-02-01', views: 45000 }
]

const ACTIVITIES = [
  { id: 1, title: '非遗技艺体验日', time: '2026-06-15 10:00-16:00', location: '市非遗展示中心', day: '15', month: '六月', description: '传承人现场展示，观众可预约互动体验。', participants: 45, capacity: 50, buttonText: '报名参加' },
  { id: 2, title: '传承人讲座直播', time: '2026-06-18 14:00-16:00', location: '线上直播', day: '18', month: '六月', description: '分享传承故事与保护经验。', participants: 1200, capacity: 0, buttonText: '预约观看' },
  { id: 3, title: '传统工艺工作坊', time: '2026-06-22 09:00-12:00', location: '区文化馆', day: '22', month: '六月', description: '木作与漆艺入门体验。', participants: 28, capacity: 30, buttonText: '报名参加' }
]

function heritageById(id) {
  const n = Number(id)
  return HERITAGE.find((h) => h.id === n)
}

function buildCollections() {
  return Array.from(mockFavoriteIds)
    .map((hid) => {
      const h = heritageById(hid)
      if (!h) return null
      return {
        id: hid,
        heritageId: hid,
        heritageName: h.name,
        name: h.name,
        heritageDescription: h.description,
        description: h.description,
        heritageLevel: h.level === 1 ? '国家级非遗项目' : '省级非遗项目',
        level: h.level,
        imageUrl: h.imageUrl,
        image: h.imageUrl
      }
    })
    .filter(Boolean)
}

function buildBookings() {
  return [
    {
      id: 201,
      type: 'experience',
      status: 'pending',
      masterId: 2,
      masterName: '张同禄',
      skill: '景泰蓝',
      masterAvatar: PIC('m2'),
      time: '2026-04-08 14:00',
      location: '东城区工坊',
      contact: '138****0000'
    }
  ]
}

function buildOverviewProfile() {
  const user = wx.getStorageSync('userInfo') || {}
  const nickname = user.nickname || user.nickName || user.username || '遗韵体验用户'
  const signature = user.signature || '遗韵随行，技艺入心'
  const avatarUrl = user.avatarUrl || buildStaticUrl('/uploads/login-bg.png.png')
  return {
    id: user.id || 1,
    userId: user.userId || user.id || 1,
    username: user.username || 'demo_user',
    nickname,
    nickName: nickname,
    avatarUrl,
    signature,
    displayName: nickname,
    displayTitle: signature
  }
}

function ok(data) {
  return Promise.resolve({ success: true, data })
}

function fail(message) {
  return Promise.resolve({ success: false, message })
}

function parseQuery(url) {
  const q = {}
  const i = url.indexOf('?')
  if (i === -1) return q
  url
    .slice(i + 1)
    .split('&')
    .forEach((pair) => {
      const [k, v] = pair.split('=')
      if (k) q[decodeURIComponent(k)] = decodeURIComponent(v || '')
    })
  return q
}

function sortNewsNewestFirst(list) {
  return [...list].sort((a, b) => {
    const ta = new Date(String(a.publishTime || '').replace(/-/g, '/')).getTime()
    const tb = new Date(String(b.publishTime || '').replace(/-/g, '/')).getTime()
    return tb - ta
  })
}

function paginateNewsList(list, query) {
  const p = Math.max(0, parseInt(query.page, 10) || 0)
  const s = Math.min(50, Math.max(1, parseInt(query.size, 10) || 20))
  const total = list.length
  const start = p * s
  const slice = list.slice(start, start + s)
  return {
    list: slice,
    total,
    page: p,
    size: s,
    hasMore: start + slice.length < total
  }
}

function mockRequest(options) {
  const method = (options.method || 'GET').toUpperCase()
  const rawUrl = options.url || ''
  const path = rawUrl.split('?')[0]
  const query = parseQuery(rawUrl)
  const body = options.data || {}

  // —— 认证（本地演示） ——
  if (method === 'POST' && path === '/auth/login') {
    const tok = `mock-token-${Date.now()}`
    return ok({
      token: tok,
      user: {
        id: 1,
        username: body.username || 'demo_user',
        nickname: body.nickname || body.username || '遗韵体验用户',
        avatarUrl: buildStaticUrl('/uploads/login-bg.png.png')
      }
    })
  }
  if (method === 'POST' && path === '/auth/register') {
    const tok = `mock-token-${Date.now()}`
    return ok({
      token: tok,
      user: {
        id: 2,
        username: body.username || 'new_user',
        nickname: (body.nickname && body.nickname.trim()) || body.username || '新用户',
        avatarUrl: buildStaticUrl('/uploads/login-bg.png.png')
      }
    })
  }

  // —— 新闻 ——
  if (method === 'GET' && path === '/news/recent') {
    const sorted = sortNewsNewestFirst(NEWS)
    return ok(paginateNewsList(sorted, query))
  }
  if (method === 'GET' && path === '/news/search') {
    const kw = (query.keyword || '').trim().toLowerCase()
    let base = sortNewsNewestFirst(NEWS)
    if (kw) {
      base = base.filter(
        (n) =>
          (n.title && n.title.toLowerCase().includes(kw)) ||
          (n.description && n.description.toLowerCase().includes(kw)) ||
          (n.content && n.content.toLowerCase().includes(kw))
      )
    }
    return ok(paginateNewsList(base, query))
  }
  if (method === 'GET' && /^\/news\/\d+$/.test(path)) {
    const id = Number(path.replace('/news/', ''))
    const n = NEWS.find((x) => x.id === id)
    return n ? ok(n) : fail('新闻不存在')
  }

  // —— 轮播 & 首页 ——
  if (method === 'GET' && path === '/banners') {
    return ok(BANNERS)
  }
  if (method === 'GET' && path === '/app/config') {
    return ok({
      appName: '传智杯',
      homeNewsSize: 5,
      homeRecommendSize: 4,
      profileCollectionPreviewSize: 3,
      profileBookingPreviewSize: 3,
      wechatLoginEnabled: true,
      usernameLoginEnabled: true,
      supportPhone: '400-800-2026',
      helpMessage: '建议先启动后端和 Redis，再打开微信开发者工具联调。',
      miniProgramVersion: 'mock-enterprise-preview'
    })
  }
  if (method === 'GET' && path === '/app/home') {
    const newsList = sortNewsNewestFirst(NEWS).slice(0, 5)
    return ok({
      bannerList: BANNERS.map((item) => ({
        ...item,
        image: item.imageUrl
      })),
      newsList,
      recommendList: HERITAGE.slice(0, 4).map((item) => ({
        ...item,
        image: item.imageUrl
      })),
      notifications: newsList.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.description,
        time: item.publishTime,
        type: 'news'
      })),
      clientConfig: {
        appName: '传智杯'
      }
    })
  }
  if (method === 'GET' && path === '/home/notifications') {
    return ok([
      { title: '云上非遗提示', content: '当前为体验数据环境，可顺畅浏览名录、AR、社区与预约等完整流程。' }
    ])
  }

  // —— 非遗 ——
  if (method === 'GET' && path === '/heritage/recommended') {
    return ok(HERITAGE.slice(0, 4))
  }
  if (method === 'GET' && path === '/heritage') {
    return ok(HERITAGE)
  }
  if (method === 'GET' && path.startsWith('/heritage/detail/')) {
    const id = path.replace('/heritage/detail/', '')
    const h = heritageById(id)
    if (!h) return fail('非遗项目不存在')
    return ok({
      ...h,
      description: `${h.description}\n\n在详情页中，可进一步收藏、分享与延伸阅读，让传统技艺的脉络更加清晰。`
    })
  }

  // —— AR ——
  if (method === 'GET' && path === '/ar/models') {
    return ok({ list: XR_MODELS })
  }
  if (method === 'GET' && path === '/ar/projects') {
    return ok({ list: AR_PROJECTS })
  }
  if (method === 'GET' && (path === '/ar/history' || path.startsWith('/ar/history'))) {
    return ok({ list: [] })
  }
  if (method === 'POST' && path === '/ar/history') {
    return ok({ id: Date.now(), saved: true })
  }
  if (method === 'DELETE' && path.startsWith('/ar/history/cleanup')) {
    return ok(true)
  }

  // —— 社区 ——
  if (method === 'GET' && path === '/inheritor/list') {
    return ok({ list: MASTERS })
  }
  if (method === 'GET' && path === '/video/list') {
    return ok({ list: VIDEOS })
  }
  if (method === 'GET' && path === '/activity/list') {
    return ok({ list: ACTIVITIES })
  }

  // —— 用户 / 收藏 / 预约 ——
  if (method === 'GET' && path === '/user/collections/me') {
    return ok(buildCollections())
  }
  if (method === 'GET' && path.startsWith('/user/collections/me/check/')) {
    const hid = Number(path.split('/').pop())
    return ok(mockFavoriteIds.has(hid))
  }
  if (method === 'POST' && path === '/user/collections') {
    const hid = Number(body.heritageId)
    if (hid) mockFavoriteIds.add(hid)
    return ok({ saved: true })
  }
  if (method === 'DELETE' && path.startsWith('/user/collections/me/heritage/')) {
    const hid = Number(path.split('/').pop())
    mockFavoriteIds.delete(hid)
    return ok(true)
  }

  if (method === 'GET' && path === '/user/bookings/me') {
    return ok(buildBookings())
  }
  if (method === 'GET' && path === '/app/me/overview') {
    const collections = buildCollections()
    const bookings = buildBookings()
    return ok({
      profile: buildOverviewProfile(),
      stats: {
        collections: collections.length,
        bookings: bookings.length
      },
      collectionPreview: collections.slice(0, 3),
      bookingPreview: bookings.slice(0, 3),
      preferences: {
        privacyEnabled: true,
        notificationEnabled: true
      }
    })
  }
  if (method === 'POST' && path === '/user/bookings') {
    mockBookingSeq += 1
    return ok({ id: mockBookingSeq, ...body })
  }
  if (method === 'DELETE' && path.startsWith('/user/bookings/me/booking/')) {
    return ok(true)
  }
  if (method === 'POST' && path === '/activity/join') {
    return ok({ joined: true })
  }

  if (method === 'PUT' && /^\/users\/\d+$/.test(path)) {
    const merged = {
      ...body,
      id: 1,
      nickname: body.nickname || '云窗客',
      avatarUrl: body.avatarUrl || buildStaticUrl('/uploads/login-bg.png.png'),
      signature: body.signature || '遗韵随行，技艺入心'
    }
    return ok(merged)
  }
  if (method === 'PATCH' && path === '/app/me/profile') {
    const current = buildOverviewProfile()
    const merged = {
      ...current,
      nickname: body.nickname || current.nickname,
      nickName: body.nickname || current.nickname,
      signature: body.signature || current.signature,
      avatarUrl: body.avatarUrl || current.avatarUrl
    }
    merged.displayName = merged.nickname
    merged.displayTitle = merged.signature || '非遗文化爱好者'
    wx.setStorageSync('userInfo', merged)
    return ok(merged)
  }

  // 其它：默认成功，避免未知接口阻塞整体体验
  console.warn('[mock] 本地数据适配未专门实现:', method, rawUrl)
  return ok(null)
}

module.exports = {
  mockRequest
}
