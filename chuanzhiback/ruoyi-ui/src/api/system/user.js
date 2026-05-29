import request from '@/utils/request'
import { parseStrEmpty } from "@/utils/ruoyi";

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  }).then(res => ({
    ...res,
    rows: (res.rows || []).map(normalizeUserRow)
  }))
}

// 查询用户详细
export function getUser(userId) {
  if (!userId) {
    return Promise.all([deptTreeSelect(), listRoleOptions()]).then(([depts, roles]) => ({
      data: {
        status: '0',
        sex: '0',
        roleIds: []
      },
      roles: roles.data || [],
      posts: [],
      postIds: [],
      roleIds: [],
      depts: depts.data || []
    }))
  }
  return request({
    url: '/system/user/' + parseStrEmpty(userId),
    method: 'get'
  }).then(res => Promise.all([listRoleOptions(), deptTreeSelect()]).then(([roles, depts]) => ({
    ...res,
    data: normalizeUserRow(res.data || {}),
    roles: roles.data || [],
    posts: [],
    postIds: [],
    roleIds: res.data?.roleIds || [],
    depts: depts.data || []
  })))
}

// 新增用户
export function addUser(data) {
  const payload = normalizeUserPayload(data)
  return request({
    url: '/system/user',
    method: 'post',
    data: payload
  })
}

// 修改用户
export function updateUser(data) {
  const payload = normalizeUserPayload(data)
  return request({
    url: '/system/user',
    method: 'put',
    data: payload
  })
}

// 删除用户
export function delUser(userId) {
  return request({
    url: '/system/user/' + userId,
    method: 'delete'
  })
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    userId,
    password
  }
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: data
  })
}

// 用户状态修改
export function changeUserStatus(userId, status) {
  const data = {
    userId,
    status
  }
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: data
  })
}

// 查询用户个人信息
export function getUserProfile() {
  return getInfoProfile()
}

// 修改用户个人信息
export function updateUserProfile(data) {
  return Promise.resolve({ code: 200, msg: '当前版本未开放个人资料修改' })
}

// 用户密码重置
export function updateUserPwd(oldPassword, newPassword) {
  return Promise.resolve({ code: 500, msg: '当前版本未开放个人密码修改' })
}

// 用户头像上传
export function uploadAvatar(data) {
  return Promise.resolve({ code: 500, msg: '当前版本未开放头像上传' })
}

// 查询授权角色
export function getAuthRole(userId) {
  return getUser(userId).then(res => ({
    user: res.data,
    roles: (res.roles || []).map(role => ({
      ...role,
      flag: (res.data?.roleIds || []).includes(role.roleId)
    })),
    roleIds: res.data?.roleIds || []
  }))
}

// 保存授权角色
export function updateAuthRole(data) {
  const roleIds = Array.isArray(data.roleIds)
    ? data.roleIds
    : String(data.roleIds || '')
        .split(',')
        .filter(Boolean)
        .map(item => Number(item))
  return updateUser({
    userId: data.userId,
    roleIds
  })
}

// 查询部门下拉树结构
export function deptTreeSelect() {
  return request({
    url: '/system/user/deptTree',
    method: 'get'
  }).then(res => ({
    ...res,
    data: normalizeDeptTree(res.data || [])
  }))
}

export function listRoleOptions() {
  return request({
    url: '/system/user/roles',
    method: 'get'
  })
}

function getInfoProfile() {
  return request({
    url: '/getInfo',
    method: 'get'
  }).then(res => ({
    data: normalizeUserRow(res.data?.user || res.user || {})
  }))
}

function normalizeUserRow(user) {
  return {
    ...user,
    phonenumber: user.phoneNumber ?? user.phonenumber ?? '',
    dept: user.dept || (user.deptName ? { deptName: user.deptName } : undefined),
    roleIds: user.roleIds || []
  }
}

function normalizeUserPayload(data) {
  const payload = { ...data }
  if ('phonenumber' in payload && !('phoneNumber' in payload)) {
    payload.phoneNumber = payload.phonenumber
  }
  delete payload.phonenumber
  delete payload.postIds
  return payload
}

function normalizeDeptTree(list) {
  return (list || []).map(item => ({
    ...item,
    id: item.deptId,
    label: item.deptName,
    children: normalizeDeptTree(item.children || [])
  }))
}
