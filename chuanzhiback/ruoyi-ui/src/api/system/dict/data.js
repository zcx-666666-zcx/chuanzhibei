import request from '@/utils/request'

const localDicts = {
  sys_normal_disable: [
    { dictLabel: '正常', dictValue: '0' },
    { dictLabel: '停用', dictValue: '1' }
  ],
  sys_user_sex: [
    { dictLabel: '男', dictValue: '0' },
    { dictLabel: '女', dictValue: '1' },
    { dictLabel: '未知', dictValue: '2' }
  ],
  sys_common_status: [
    { dictLabel: '成功', dictValue: '0' },
    { dictLabel: '失败', dictValue: '1' }
  ],
  sys_oper_type: [
    { dictLabel: '新增', dictValue: '1' },
    { dictLabel: '修改', dictValue: '2' },
    { dictLabel: '删除', dictValue: '3' },
    { dictLabel: '查询', dictValue: '4' },
    { dictLabel: '登录', dictValue: '5' }
  ]
}

// 查询字典数据列表
export function listData(query) {
  return request({
    url: '/system/dict/data/list',
    method: 'get',
    params: query
  })
}

// 查询字典数据详细
export function getData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'get'
  })
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return Promise.resolve({
    data: localDicts[dictType] || []
  })
}

// 新增字典数据
export function addData(data) {
  return request({
    url: '/system/dict/data',
    method: 'post',
    data: data
  })
}

// 修改字典数据
export function updateData(data) {
  return request({
    url: '/system/dict/data',
    method: 'put',
    data: data
  })
}

// 删除字典数据
export function delData(dictCode) {
  return request({
    url: '/system/dict/data/' + dictCode,
    method: 'delete'
  })
}
