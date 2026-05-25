import request from '@/utils/request'

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/system/menu/list',
    method: 'get',
    params: query
  }).then(res => ({
    ...res,
    data: normalizeMenuTree(res.data || [])
  }))
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'get'
  })
}

// 查询菜单下拉树结构
export function treeselect() {
  return request({
    url: '/system/menu/treeselect',
    method: 'get'
  }).then(res => ({
    ...res,
    data: normalizeMenuTree(res.data || [])
  }))
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  }).then(res => ({
    ...res,
    menus: normalizeMenuTree(res.data?.menus || []),
    checkedKeys: res.data?.checkedKeys || []
  }))
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/system/menu',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data) {
  return request({
    url: '/system/menu',
    method: 'put',
    data: data
  })
}

// 保存菜单排序
export function updateMenuSort(data) {
  const items = String(data.menuIds || '')
    .split(',')
    .filter(Boolean)
    .map((id, idx) => ({
      menuId: Number(id),
      orderNum: Number(String(data.orderNums || '').split(',')[idx] || 0)
    }))
  return request({
    url: '/system/menu/updateSort',
    method: 'put',
    data: items
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: '/system/menu/' + menuId,
    method: 'delete'
  })
}

function normalizeMenuTree(list) {
  return (list || []).map(item => ({
    ...item,
    id: item.menuId,
    label: item.menuName,
    children: normalizeMenuTree(item.children || [])
  }))
}
