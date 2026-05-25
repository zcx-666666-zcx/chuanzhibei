<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addBanner, delBanner, getBanner, listBanner, updateBanner } from '@/api/business/banner'

const page = {
  title: '轮播图',
  api: { list: listBanner, get: getBanner, add: addBanner, update: updateBanner, remove: delBanner },
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'title', label: '标题', minWidth: 180 },
    { prop: 'imageUrl', label: '图片地址', minWidth: 220 },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'title', label: '标题' },
    { prop: 'imageUrl', label: '图片地址', span: 24 },
    { prop: 'description', label: '说明', type: 'textarea', span: 24 }
  ]
}
</script>
