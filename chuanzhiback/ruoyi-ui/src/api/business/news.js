import request from '@/utils/request'

export function listNews(query) {
  return request({
    url: '/business/news/list',
    method: 'get',
    params: query
  })
}

export function getNews(id) {
  return request({
    url: `/business/news/${id}`,
    method: 'get'
  })
}

export function addNews(data) {
  return request({
    url: '/business/news',
    method: 'post',
    data
  })
}

export function updateNews(data) {
  return request({
    url: '/business/news',
    method: 'put',
    data
  })
}

export function delNews(ids) {
  return request({
    url: `/business/news/${ids}`,
    method: 'delete'
  })
}
