<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addNews, delNews, getNews, listNews, updateNews } from '@/api/business/news'

const page = {
  title: '新闻',
  api: { list: listNews, get: getNews, add: addNews, update: updateNews, remove: delNews },
  filters: [{ prop: 'title', label: '标题' }],
  columns: [
    { prop: 'id', label: 'ID', width: 100 },
    { prop: 'title', label: '标题', minWidth: 220 },
    { prop: 'author', label: '作者' },
    { prop: 'date', label: '日期', type: 'date', minWidth: 140 },
    { prop: 'publishTime', label: '发布时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'title', label: '标题', span: 24 },
    { prop: 'author', label: '作者' },
    { prop: 'date', label: '日期', type: 'date' },
    { prop: 'publishTime', label: '发布时间', type: 'datetime', span: 24 },
    { prop: 'imageUrls', label: '图片地址', span: 24 },
    { prop: 'description', label: '摘要', type: 'textarea', span: 24 },
    { prop: 'content', label: '正文', type: 'textarea', span: 24, rows: 6 }
  ]
}
</script>
