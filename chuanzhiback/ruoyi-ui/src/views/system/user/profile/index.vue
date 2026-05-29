<template>
  <div class="app-container profile-page">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-tag type="warning">当前版本为只读展示</el-tag>
        </div>
      </template>
      <div v-loading="loading" class="profile-grid">
        <div class="item">
          <label>用户账号</label>
          <span>{{ user.userName || '-' }}</span>
        </div>
        <div class="item">
          <label>用户昵称</label>
          <span>{{ user.nickName || '-' }}</span>
        </div>
        <div class="item">
          <label>邮箱</label>
          <span>{{ user.email || '-' }}</span>
        </div>
        <div class="item">
          <label>手机号</label>
          <span>{{ user.phoneNumber || '-' }}</span>
        </div>
        <div class="item">
          <label>状态</label>
          <span>{{ user.status === '0' ? '正常' : '停用' }}</span>
        </div>
        <div class="item">
          <label>创建时间</label>
          <span>{{ user.createTime || '-' }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup name="Profile">
import { getUserProfile } from '@/api/system/user'

const loading = ref(false)
const user = ref({})

async function loadProfile() {
  loading.value = true
  try {
    const res = await getUserProfile()
    user.value = res.data || {}
  } finally {
    loading.value = false
  }
}

onMounted(loadProfile)
</script>

<style lang="scss" scoped>
.profile-card {
  max-width: 920px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.item {
  padding: 16px;
  background: #f8f9fc;
  border-radius: 14px;
}

.item label {
  display: block;
  margin-bottom: 8px;
  font-size: 12px;
  color: #8a92a6;
}

.item span {
  color: #233042;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
