import request from '@/utils/request'

export function listActivity(query) {
  return request({
    url: '/business/activity/list',
    method: 'get',
    params: query
  })
}

export function getActivity(id) {
  return request({
    url: `/business/activity/${id}`,
    method: 'get'
  })
}

export function addActivity(data) {
  return request({
    url: '/business/activity',
    method: 'post',
    data
  })
}

export function updateActivity(data) {
  return request({
    url: '/business/activity',
    method: 'put',
    data
  })
}

export function delActivity(ids) {
  return request({
    url: `/business/activity/${ids}`,
    method: 'delete'
  })
}
