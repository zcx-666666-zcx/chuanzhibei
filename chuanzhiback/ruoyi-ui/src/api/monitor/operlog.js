import request from '@/utils/request'

// 查询操作日志列表
export function list(query) {
  return request({
    url: '/monitor/operlog/list',
    method: 'get',
    params: query
  })
}

// 删除操作日志
export function delOperlog(operId) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放日志删除' })
}

// 清空操作日志
export function cleanOperlog() {
  return Promise.resolve({ code: 200, msg: '当前版本未开放日志清空' })
}
