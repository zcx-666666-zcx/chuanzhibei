import request from '@/utils/request'

export function listInheritor(query) {
  return request({
    url: '/business/inheritor/list',
    method: 'get',
    params: query
  })
}

export function getInheritor(id) {
  return request({
    url: `/business/inheritor/${id}`,
    method: 'get'
  })
}

export function addInheritor(data) {
  return request({
    url: '/business/inheritor',
    method: 'post',
    data
  })
}

export function updateInheritor(data) {
  return request({
    url: '/business/inheritor',
    method: 'put',
    data
  })
}

export function delInheritor(ids) {
  return request({
    url: `/business/inheritor/${ids}`,
    method: 'delete'
  })
}
