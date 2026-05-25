import request from '@/utils/request'

// 查询角色列表
export function listRole(query) {
  return request({
    url: '/system/role/list',
    method: 'get',
    params: query
  })
}

// 查询角色详细
export function getRole(roleId) {
  return request({
    url: '/system/role/' + roleId,
    method: 'get'
  }).then(res => ({
    ...res,
    data: {
      ...res.data,
      menuCheckStrictly: !!res.data?.menuCheckStrictly,
      deptCheckStrictly: !!res.data?.deptCheckStrictly
    }
  }))
}

// 新增角色
export function addRole(data) {
  return request({
    url: '/system/role',
    method: 'post',
    data: data
  })
}

// 修改角色
export function updateRole(data) {
  return request({
    url: '/system/role',
    method: 'put',
    data: data
  })
}

// 角色数据权限
export function dataScope(data) {
  return updateRole(data)
}

// 角色状态修改
export function changeRoleStatus(roleId, status) {
  const data = {
    roleId,
    status
  }
  return request({
    url: '/system/role/changeStatus',
    method: 'put',
    data: data
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: '/system/role/' + roleId,
    method: 'delete'
  })
}

// 查询角色已授权用户列表
export function allocatedUserList(query) {
  return Promise.resolve({ rows: [], total: 0 })
}

// 查询角色未授权用户列表
export function unallocatedUserList(query) {
  return Promise.resolve({ rows: [], total: 0 })
}

// 取消用户授权角色
export function authUserCancel(data) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放角色用户分配' })
}

// 批量取消用户授权角色
export function authUserCancelAll(data) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放角色用户分配' })
}

// 授权用户选择
export function authUserSelectAll(data) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放角色用户分配' })
}

// 根据角色ID查询部门树结构
export function deptTreeSelect(roleId) {
  return request({
    url: '/system/role/deptTree/' + roleId,
    method: 'get'
  }).then(res => ({
    ...res,
    depts: normalizeTree(res.data || [], 'deptId', 'deptName'),
    checkedKeys: []
  }))
}

function normalizeTree(list, idField, labelField) {
  return (list || []).map(item => ({
    ...item,
    id: item[idField],
    label: item[labelField],
    children: normalizeTree(item.children || [], idField, labelField)
  }))
}
