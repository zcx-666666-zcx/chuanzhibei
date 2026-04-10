const { buildStaticUrl } = require('./config.js')

/**
 * 解析 /news/recent、/news/search 返回的 data：支持分页对象或旧版纯数组。
 */
function normalizeNewsResponseData(data) {
  if (!data) {
    return { list: [], total: 0, page: 0, size: 0, hasMore: false }
  }
  if (Array.isArray(data)) {
    return { list: data, total: data.length, page: 0, size: data.length, hasMore: false }
  }
  const list = Array.isArray(data.list) ? data.list : []
  return {
    list,
    total: typeof data.total === 'number' ? data.total : list.length,
    page: typeof data.page === 'number' ? data.page : 0,
    size: typeof data.size === 'number' ? data.size : list.length,
    hasMore: Boolean(data.hasMore)
  }
}

function mapNewsItem(item) {
  let image = ''
  if (item.imageUrls) {
    const first = item.imageUrls.split(',')[0].trim()
    image = first.startsWith('http') ? first : buildStaticUrl(first)
  } else if (item.id != null) {
    image = buildStaticUrl(`/uploads/news_index/news_${item.id}.jpg`)
  }

  let dateStr = ''
  let relTime = ''
  let parsed = null
  const publishTime = item.publishTime
  if (publishTime) {
    if (typeof publishTime === 'object' && publishTime.year) {
      dateStr = `${publishTime.year}-${String(publishTime.monthValue).padStart(2, '0')}-${String(publishTime.dayOfMonth).padStart(2, '0')}`
      parsed = new Date(dateStr)
    } else if (typeof publishTime === 'object' && Object.prototype.hasOwnProperty.call(publishTime, 'time')) {
      parsed = new Date(publishTime.time)
      dateStr = `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
    } else if (typeof publishTime === 'string') {
      dateStr = publishTime.split(' ')[0]
      parsed = new Date(publishTime.replace(/-/g, '/'))
    }
  }
  if (parsed && !Number.isNaN(parsed.getTime())) {
    const diff = Date.now() - parsed.getTime()
    const day = 86400000
    if (diff >= 0 && diff < day) {
      relTime = '今天'
    } else if (diff >= 0 && diff < 2 * day) {
      relTime = '昨天'
    } else if (diff >= 0 && diff < 7 * day) {
      relTime = `${Math.floor(diff / day)} 天前`
    }
  }
  if (!relTime) {
    relTime = dateStr
  }

  const author = (item.author && String(item.author).trim()) || '遗韵编辑'

  return {
    ...item,
    image,
    date: dateStr,
    relTime,
    authorDisplay: author
  }
}

module.exports = {
  normalizeNewsResponseData,
  mapNewsItem
}
