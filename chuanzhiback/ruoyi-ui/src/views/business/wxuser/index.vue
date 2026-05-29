<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { delWxUser, getWxUser, listWxUser } from '@/api/business/wxuser'

const page = {
  title: '小程序用户',
  api: { list: listWxUser, get: getWxUser, remove: delWxUser },
  allowCreate: false,
  allowEdit: false,
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'nickname', label: '昵称' },
    { prop: 'username', label: '账号' },
    { prop: 'city', label: '城市' },
    { prop: 'email', label: '邮箱', minWidth: 180 },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  filters: [{ prop: 'nickname', label: '昵称' }],
  formFields: []
}
</script>
