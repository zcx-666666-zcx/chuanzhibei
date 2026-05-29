import request from '@/utils/request'

export function listBooking(query) {
  return request({
    url: '/business/booking/list',
    method: 'get',
    params: query
  })
}

export function getBooking(id) {
  return request({
    url: `/business/booking/${id}`,
    method: 'get'
  })
}

export function updateBooking(data) {
  return request({
    url: '/business/booking',
    method: 'put',
    data
  })
}

export function delBooking(ids) {
  return request({
    url: `/business/booking/${ids}`,
    method: 'delete'
  })
}
