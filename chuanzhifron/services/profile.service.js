const { request, requestErrorMessage } = require('../utils/util.js')
const { setCurrentUser } = require('../utils/session.js')
const { buildStaticUrl } = require('../utils/config.js')

function resolveStaticUrl(url) {
  if (!url) {
    return ''
  }
  return /^https?:\/\//.test(url) ? url : buildStaticUrl(url)
}

function mapCollection(item) {
  return Object.assign({}, item, {
    image: resolveStaticUrl(item.image || item.imageUrl),
    imageUrl: resolveStaticUrl(item.imageUrl || item.image)
  })
}

function mapBooking(item) {
  return Object.assign({}, item, {
    masterAvatar: resolveStaticUrl(item.masterAvatar || '')
  })
}

function loadMyOverview() {
  return request({
    url: '/app/me/overview'
  }).then((res) => {
    const data = (res && res.data) || {}
    const profile = data.profile || {}
    setCurrentUser(profile)
    return {
      profile,
      stats: data.stats || { collections: 0, bookings: 0 },
      collections: Array.isArray(data.collectionPreview) ? data.collectionPreview.map(mapCollection) : [],
      bookings: Array.isArray(data.bookingPreview) ? data.bookingPreview.map(mapBooking) : [],
      preferences: data.preferences || {}
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function updateMyProfile(payload) {
  return request({
    url: '/app/me/profile',
    method: 'PATCH',
    data: payload
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '保存失败')
    }
    const profile = res.data || {}
    setCurrentUser(profile)
    return profile
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function cancelMyBooking(bookingId) {
  return request({
    url: `/user/bookings/me/booking/${bookingId}`,
    method: 'DELETE'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '取消预约失败')
    }
    return true
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function removeMyCollection(heritageId) {
  return request({
    url: `/user/collections/me/heritage/${heritageId}`,
    method: 'DELETE'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '移除收藏失败')
    }
    return true
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function listMyCollections() {
  return request({
    url: '/user/collections/me'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取收藏失败')
    }
    const list = Array.isArray(res.data) ? res.data : []
    return list.map((item) => {
      const mapped = mapCollection(item)
      mapped.name = item.heritageName || item.name || ''
      mapped.level = item.heritageLevel || item.level || ''
      mapped.description = item.heritageDescription || item.description || ''
      mapped.heritageId = item.heritageId || item.id
      return mapped
    })
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function listMyBookings() {
  return request({
    url: '/user/bookings/me'
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '获取预约失败')
    }
    const list = Array.isArray(res.data) ? res.data : []
    return list.map((booking) => {
      const item = mapBooking(booking)
      return {
        id: item.id,
        status: item.status || 'pending',
        statusText: resolveStatusText(item.status || 'pending'),
        time: item.time || '待确认',
        location: item.location || '待确认',
        contact: item.contact || '待确认',
        masterId: item.masterId,
        masterName: item.type === 'experience' ? (item.masterName || '') : (item.activityTitle || ''),
        skill: item.type === 'experience' ? (item.skill || '') : (item.type === 'activity' ? '活动报名' : '预约观看'),
        masterAvatar: item.masterAvatar || '',
        type: item.type || 'experience',
        activityId: item.activityId,
        activityTitle: item.activityTitle || ''
      }
    })
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function addMyCollection(payload) {
  return request({
    url: '/user/collections',
    method: 'POST',
    data: payload
  }).then((res) => {
    if (!res.success) {
      throw new Error(res.message || '收藏失败')
    }
    return res.data || true
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function checkMyCollection(heritageId) {
  return request({
    url: `/user/collections/me/check/${heritageId}`
  }).then((res) => {
    if (!res.success) {
      return false
    }
    return Boolean(res.data)
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

function resolveStatusText(status) {
  switch (status) {
    case 'confirmed':
      return '已确认'
    case 'cancelled':
      return '已取消'
    case 'completed':
      return '已完成'
    default:
      return '待确认'
  }
}

module.exports = {
  addMyCollection,
  cancelMyBooking,
  checkMyCollection,
  listMyBookings,
  listMyCollections,
  loadMyOverview,
  removeMyCollection,
  updateMyProfile
}
