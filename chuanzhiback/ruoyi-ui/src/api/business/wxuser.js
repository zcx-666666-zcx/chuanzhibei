import request from '@/utils/request'

export function listWxUser(query) {
  return request({
    url: '/business/wxuser/list',
    method: 'get',
    params: query
  })
}

export function getWxUser(id) {
  return request({
    url: `/business/wxuser/${id}`,
    method: 'get'
  })
}

export function delWxUser(ids) {
  return request({
    url: `/business/wxuser/${ids}`,
    method: 'delete'
  })
}
