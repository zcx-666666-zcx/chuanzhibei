<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addVideo, delVideo, getVideo, listVideo, updateVideo } from '@/api/business/video'

const page = {
  title: '视频',
  api: { list: listVideo, get: getVideo, add: addVideo, update: updateVideo, remove: delVideo },
  filters: [{ prop: 'title', label: '标题' }],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'title', label: '标题', minWidth: 200 },
    { prop: 'category', label: '分类' },
    { prop: 'duration', label: '时长' },
    { prop: 'views', label: '浏览量' },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'title', label: '标题', span: 24 },
    { prop: 'category', label: '分类' },
    { prop: 'duration', label: '时长' },
    { prop: 'views', label: '浏览量', type: 'number' },
    { prop: 'thumbnail', label: '封面地址', span: 24 },
    { prop: 'videoUrl', label: '视频地址', span: 24 },
    { prop: 'description', label: '简介', type: 'textarea', span: 24 }
  ]
}
</script>
