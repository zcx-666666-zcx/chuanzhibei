import request from '@/utils/request'

export function listVideo(query) {
  return request({
    url: '/business/video/list',
    method: 'get',
    params: query
  })
}

export function getVideo(id) {
  return request({
    url: `/business/video/${id}`,
    method: 'get'
  })
}

export function addVideo(data) {
  return request({
    url: '/business/video',
    method: 'post',
    data
  })
}

export function updateVideo(data) {
  return request({
    url: '/business/video',
    method: 'put',
    data
  })
}

export function delVideo(ids) {
  return request({
    url: `/business/video/${ids}`,
    method: 'delete'
  })
}
