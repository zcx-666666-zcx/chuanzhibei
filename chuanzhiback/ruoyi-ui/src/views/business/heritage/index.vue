<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addHeritage, delHeritage, getHeritage, listHeritage, updateHeritage } from '@/api/business/heritage'

const page = {
  title: '非遗项目',
  api: { list: listHeritage, get: getHeritage, add: addHeritage, update: updateHeritage, remove: delHeritage },
  filters: [
    { prop: 'name', label: '名称' },
    { prop: 'category', label: '分类' }
  ],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '名称', minWidth: 180 },
    { prop: 'category', label: '分类' },
    { prop: 'region', label: '地区' },
    { prop: 'level', label: '级别' },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'name', label: '名称' },
    { prop: 'category', label: '分类' },
    { prop: 'region', label: '地区' },
    { prop: 'level', label: '级别', type: 'number' },
    { prop: 'imageUrl', label: '图片地址', span: 24 },
    { prop: 'description', label: '简介', type: 'textarea', span: 24 }
  ]
}
</script>
