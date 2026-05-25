import request from '@/utils/request'

export function listBanner(query) {
  return request({
    url: '/business/banner/list',
    method: 'get',
    params: query
  })
}

export function getBanner(id) {
  return request({
    url: `/business/banner/${id}`,
    method: 'get'
  })
}

export function addBanner(data) {
  return request({
    url: '/business/banner',
    method: 'post',
    data
  })
}

export function updateBanner(data) {
  return request({
    url: '/business/banner',
    method: 'put',
    data
  })
}

export function delBanner(ids) {
  return request({
    url: `/business/banner/${ids}`,
    method: 'delete'
  })
}
