import request from '@/utils/request'

export function listHeritage(query) {
  return request({
    url: '/business/heritage/list',
    method: 'get',
    params: query
  })
}

export function getHeritage(id) {
  return request({
    url: `/business/heritage/${id}`,
    method: 'get'
  })
}

export function addHeritage(data) {
  return request({
    url: '/business/heritage',
    method: 'post',
    data
  })
}

export function updateHeritage(data) {
  return request({
    url: '/business/heritage',
    method: 'put',
    data
  })
}

export function delHeritage(ids) {
  return request({
    url: `/business/heritage/${ids}`,
    method: 'delete'
  })
}
