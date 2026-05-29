import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/monitor/logininfor/list',
    method: 'get',
    params: query
  })
}

// 删除登录日志
export function delLogininfor(infoId) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放登录日志删除' })
}

// 解锁用户登录状态
export function unlockLogininfor(userName) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放解锁功能' })
}

// 清空登录日志
export function cleanLogininfor() {
  return Promise.resolve({ code: 200, msg: '当前版本未开放登录日志清空' })
}
