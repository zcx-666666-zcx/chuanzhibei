import request from '@/utils/request'

export function listAr(query) {
  return request({
    url: '/business/ar/list',
    method: 'get',
    params: query
  })
}

export function getAr(id) {
  return request({
    url: `/business/ar/${id}`,
    method: 'get'
  })
}

export function addAr(data) {
  return request({
    url: '/business/ar',
    method: 'post',
    data
  })
}

export function updateAr(data) {
  return request({
    url: '/business/ar',
    method: 'put',
    data
  })
}

export function delAr(ids) {
  return request({
    url: `/business/ar/${ids}`,
    method: 'delete'
  })
}
