<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { delBooking, getBooking, listBooking, updateBooking } from '@/api/business/booking'

const statusOptions = [
  { label: '待处理', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '已取消', value: 'cancelled' }
]

const page = {
  title: '预约',
  api: { list: listBooking, get: getBooking, update: updateBooking, remove: delBooking },
  allowCreate: false,
  filters: [
    { prop: 'status', label: '状态', type: 'select', options: statusOptions },
    { prop: 'bookingType', label: '类型' }
  ],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'bookingType', label: '预约类型' },
    { prop: 'masterName', label: '传承人' },
    { prop: 'activityTitle', label: '活动' },
    { prop: 'status', label: '状态', type: 'select', options: statusOptions },
    { prop: 'bookingTime', label: '预约时间', minWidth: 180 },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'bookingType', label: '预约类型' },
    { prop: 'masterName', label: '传承人' },
    { prop: 'activityTitle', label: '活动' },
    { prop: 'contact', label: '联系方式' },
    { prop: 'location', label: '地点' },
    { prop: 'status', label: '状态', type: 'select', options: statusOptions },
    { prop: 'bookingTime', label: '预约时间', span: 24 },
    { prop: 'skill', label: '技能说明', span: 24 }
  ]
}
</script>
