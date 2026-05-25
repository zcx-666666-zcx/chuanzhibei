<template>
  <el-drawer v-model="visible" title="用户详情" direction="rtl" size="520px" append-to-body>
    <div v-loading="loading" class="profile-sheet">
      <dl>
        <div>
          <dt>用户账号</dt>
          <dd>{{ info.userName || '-' }}</dd>
        </div>
        <div>
          <dt>用户昵称</dt>
          <dd>{{ info.nickName || '-' }}</dd>
        </div>
        <div>
          <dt>邮箱</dt>
          <dd>{{ info.email || '-' }}</dd>
        </div>
        <div>
          <dt>手机号</dt>
          <dd>{{ info.phoneNumber || '-' }}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{{ info.status === '0' ? '正常' : '停用' }}</dd>
        </div>
        <div>
          <dt>角色 ID</dt>
          <dd>{{ (info.roleIds || []).join('、') || '-' }}</dd>
        </div>
        <div>
          <dt>创建时间</dt>
          <dd>{{ info.createTime || '-' }}</dd>
        </div>
        <div>
          <dt>更新时间</dt>
          <dd>{{ info.updateTime || '-' }}</dd>
        </div>
        <div class="full">
          <dt>备注</dt>
          <dd>{{ info.remark || '-' }}</dd>
        </div>
      </dl>
    </div>
  </el-drawer>
</template>

<script setup>
import { getUser } from '@/api/system/user'

const visible = ref(false)
const loading = ref(false)
const info = ref({})

async function open(userId) {
  visible.value = true
  loading.value = true
  try {
    const res = await getUser(userId)
    info.value = res.data || {}
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>

<style lang="scss" scoped>
.profile-sheet {
  padding: 8px 4px;
}

dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

div {
  padding: 16px;
  border-radius: 16px;
  background: #f8f9fb;
}

dt {
  font-size: 12px;
  color: #8a94a6;
  margin-bottom: 8px;
}

dd {
  margin: 0;
  color: #243041;
  line-height: 1.6;
  word-break: break-all;
}

.full {
  grid-column: 1 / -1;
}
</style>
