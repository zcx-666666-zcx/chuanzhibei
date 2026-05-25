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
  return Object.assign({}, item)
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

module.exports = {
  cancelMyBooking,
  loadMyOverview,
  removeMyCollection,
  updateMyProfile
}
