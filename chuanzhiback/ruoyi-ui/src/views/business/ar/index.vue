<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addAr, delAr, getAr, listAr, updateAr } from '@/api/business/ar'

const page = {
  title: '3D沉浸演示',
  api: { list: listAr, get: getAr, add: addAr, update: updateAr, remove: delAr },
  filters: [{ prop: 'name', label: '名称' }],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '名称' },
    { prop: 'imageUrl', label: '封面地址', minWidth: 220 },
    { prop: 'modelUrl', label: 'GLB模型地址', minWidth: 240 },
    { prop: 'isHot', label: '热门', type: 'switch' },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'name', label: '演示名称' },
    { prop: 'isHot', label: '是否热门', type: 'switch', activeValue: true, inactiveValue: false },
    { prop: 'imageUrl', label: '封面地址', span: 24 },
    {
      prop: 'modelUrl',
      label: 'GLB模型文件',
      type: 'file',
      span: 24,
      action: 'http://127.0.0.1:8001/api/files/upload',
      data: { type: '3d' },
      limit: 1,
      fileSize: 100,
      fileType: ['glb', 'gltf']
    },
    { prop: 'description', label: '演示说明', type: 'textarea', span: 24 },
    { prop: 'instructions', label: '讲解说明', type: 'textarea', span: 24, rows: 5 }
  ]
}
</script>
