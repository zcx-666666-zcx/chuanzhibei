<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addActivity, delActivity, getActivity, listActivity, updateActivity } from '@/api/business/activity'

const statusOptions = [
  { label: '待开始', value: 'pending' },
  { label: '进行中', value: 'ongoing' },
  { label: '已结束', value: 'finished' }
]

const page = {
  title: '活动',
  api: { list: listActivity, get: getActivity, add: addActivity, update: updateActivity, remove: delActivity },
  filters: [{ prop: 'title', label: '标题' }],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'title', label: '标题', minWidth: 200 },
    { prop: 'location', label: '地点' },
    { prop: 'status', label: '状态', type: 'select', options: statusOptions },
    { prop: 'startTime', label: '开始时间', type: 'datetime', minWidth: 180 },
    { prop: 'endTime', label: '结束时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'title', label: '标题', span: 24 },
    { prop: 'location', label: '地点', span: 24 },
    { prop: 'status', label: '状态', type: 'select', options: statusOptions },
    { prop: 'capacity', label: '容量', type: 'number' },
    { prop: 'participants', label: '已报名', type: 'number' },
    { prop: 'startTime', label: '开始时间', type: 'datetime', span: 12 },
    { prop: 'endTime', label: '结束时间', type: 'datetime', span: 12 },
    { prop: 'description', label: '说明', type: 'textarea', span: 24 }
  ]
}
</script>
