const { request, requestErrorMessage } = require('../utils/util.js')
const { mapNewsItem } = require('../utils/newsDisplay.js')
const { buildStaticUrl } = require('../utils/config.js')

function resolveStaticUrl(url) {
  if (!url) {
    return ''
  }
  return /^https?:\/\//.test(url) ? url : buildStaticUrl(url)
}

function mapBanner(item) {
  return Object.assign({}, item, {
    image: resolveStaticUrl(item.image || item.imageUrl),
    newsId: item.newsId || item.id
  })
}

function mapHeritage(item) {
  return Object.assign({}, item, {
    image: resolveStaticUrl(item.image || item.imageUrl),
    imageUrl: resolveStaticUrl(item.imageUrl || item.image)
  })
}

function loadHomePayload() {
  return request({
    url: '/app/home'
  }).then((res) => {
    const data = (res && res.data) || {}
    const newsList = Array.isArray(data.newsList) ? data.newsList.map(mapNewsItem) : []
    return {
      bannerList: Array.isArray(data.bannerList) ? data.bannerList.map(mapBanner) : [],
      newsList,
      displayNewsList: newsList.slice(0, 5),
      recommendList: Array.isArray(data.recommendList) ? data.recommendList.map(mapHeritage) : [],
      notifications: Array.isArray(data.notifications) ? data.notifications : [],
      clientConfig: data.clientConfig || {}
    }
  }).catch((err) => {
    throw new Error(requestErrorMessage(err))
  })
}

module.exports = {
  loadHomePayload
}
