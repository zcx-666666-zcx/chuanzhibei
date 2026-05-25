<template>
  <BusinessCrudPage v-bind="page" />
</template>

<script setup>
import BusinessCrudPage from '@/components/BusinessCrudPage'
import { addInheritor, delInheritor, getInheritor, listInheritor, updateInheritor } from '@/api/business/inheritor'

const page = {
  title: '传承人',
  api: { list: listInheritor, get: getInheritor, add: addInheritor, update: updateInheritor, remove: delInheritor },
  filters: [{ prop: 'name', label: '姓名' }],
  columns: [
    { prop: 'id', label: 'ID', width: 80 },
    { prop: 'name', label: '姓名' },
    { prop: 'skill', label: '技艺' },
    { prop: 'level', label: '级别' },
    { prop: 'createTime', label: '创建时间', type: 'datetime', minWidth: 180 }
  ],
  formFields: [
    { prop: 'name', label: '姓名' },
    { prop: 'skill', label: '技艺' },
    { prop: 'level', label: '级别' },
    { prop: 'imageUrl', label: '头像地址', span: 24 },
    { prop: 'description', label: '简介', type: 'textarea', span: 24 }
  ]
}
</script>
