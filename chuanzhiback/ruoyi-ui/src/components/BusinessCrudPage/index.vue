<template>
  <div class="app-container">
    <el-form v-if="filters.length" :model="queryParams" :inline="true" class="query-form">
      <el-form-item v-for="field in filters" :key="field.prop" :label="field.label">
        <el-select
          v-if="field.type === 'select'"
          v-model="queryParams[field.prop]"
          clearable
          :placeholder="field.placeholder || `请选择${field.label}`"
          style="width: 220px"
        >
          <el-option
            v-for="option in field.options || []"
            :key="String(option.value)"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-input
          v-else
          v-model="queryParams[field.prop]"
          clearable
          :placeholder="field.placeholder || `请输入${field.label}`"
          style="width: 220px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col v-if="allowCreate" :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col v-if="allowDelete" :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="selectedIds.length === 0" @click="handleDelete()">批量删除</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="rows" @selection-change="handleSelectionChange">
      <el-table-column v-if="allowDelete" type="selection" width="55" align="center" />
      <el-table-column
        v-for="column in columns"
        :key="column.prop"
        :label="column.label"
        :prop="column.prop"
        :width="column.width"
        :min-width="column.minWidth || 120"
        :show-overflow-tooltip="column.showOverflowTooltip !== false"
      >
        <template #default="{ row }">
          <el-tag v-if="column.type === 'select'" size="small">{{ formatSelect(row[column.prop], column.options) }}</el-tag>
          <el-switch
            v-else-if="column.type === 'switch'"
            :model-value="row[column.prop]"
            :active-value="column.activeValue ?? true"
            :inactive-value="column.inactiveValue ?? false"
            disabled
          />
          <el-link
            v-else-if="column.type === 'link' && row[column.prop]"
            :href="row[column.prop]"
            target="_blank"
            type="primary"
          >
            {{ column.linkText || '查看' }}
          </el-link>
          <span v-else-if="column.type === 'datetime'">{{ parseTime(row[column.prop]) || '-' }}</span>
          <span v-else-if="column.type === 'date'">{{ parseTime(row[column.prop], '{y}-{m}-{d}') || '-' }}</span>
          <span v-else>{{ formatPlain(row[column.prop]) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-if="allowEdit || allowDelete" label="操作" align="center" min-width="160" fixed="right">
        <template #default="{ row }">
          <el-button v-if="allowEdit" link type="primary" icon="Edit" @click="handleEdit(row)">修改</el-button>
          <el-button v-if="allowDelete" link type="danger" icon="Delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <el-dialog
      v-if="allowCreate || allowEdit"
      v-model="open"
      :title="dialogTitle"
      :width="dialogWidth"
      append-to-body
    >
      <el-form ref="formRef" :model="formModel" label-width="100px">
        <el-row :gutter="16">
          <el-col v-for="field in formFields" :key="field.prop" :span="field.span || 12">
            <el-form-item :label="field.label">
              <el-select
                v-if="field.type === 'select'"
                v-model="formModel[field.prop]"
                clearable
                :placeholder="field.placeholder || `请选择${field.label}`"
              >
                <el-option
                  v-for="option in field.options || []"
                  :key="String(option.value)"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="formModel[field.prop]"
                :min="field.min ?? 0"
                controls-position="right"
                style="width: 100%"
              />
              <FileUpload
                v-else-if="field.type === 'file'"
                v-model="formModel[field.prop]"
                :action="field.action || '/api/files/upload'"
                :data="field.data || {}"
                :limit="field.limit || 1"
                :fileSize="field.fileSize || 50"
                :fileType="field.fileType || ['glb', 'gltf']"
                :isShowTip="field.isShowTip !== false"
              />
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="formModel[field.prop]"
                :active-value="field.activeValue ?? true"
                :inactive-value="field.inactiveValue ?? false"
              />
              <el-date-picker
                v-else-if="field.type === 'datetime'"
                v-model="formModel[field.prop]"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="formModel[field.prop]"
                type="date"
                value-format="YYYY-MM-DD"
                format="YYYY-MM-DD"
                style="width: 100%"
              />
              <el-input
                v-else
                v-model="formModel[field.prop]"
                :type="field.type === 'textarea' ? 'textarea' : 'text'"
                :rows="field.rows || 4"
                :placeholder="field.placeholder || `请输入${field.label}`"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确定</el-button>
        <el-button @click="open = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { parseTime } from '@/utils/ruoyi'

const props = defineProps({
  title: { type: String, required: true },
  api: { type: Object, required: true },
  columns: { type: Array, default: () => [] },
  filters: { type: Array, default: () => [] },
  formFields: { type: Array, default: () => [] },
  idField: { type: String, default: 'id' },
  allowCreate: { type: Boolean, default: true },
  allowEdit: { type: Boolean, default: true },
  allowDelete: { type: Boolean, default: true },
  dialogWidth: { type: String, default: '760px' }
})

const loading = ref(false)
const open = ref(false)
const rows = ref([])
const total = ref(0)
const selectedIds = ref([])
const formRef = ref()
const dialogTitle = ref('')

const queryParams = reactive(buildInitialQuery())
const formModel = ref(buildInitialForm())

const filters = computed(() => props.filters || [])
const formFields = computed(() => props.formFields || [])
const columns = computed(() => props.columns || [])

watch(
  () => props.filters,
  () => Object.assign(queryParams, buildInitialQuery()),
  { deep: true }
)

async function getList() {
  loading.value = true
  try {
    const response = await props.api.list({ ...queryParams })
    rows.value = response.rows || response.data || []
    total.value = response.total || rows.value.length
  } finally {
    loading.value = false
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  Object.assign(queryParams, buildInitialQuery())
  getList()
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map(item => item[props.idField])
}

function handleAdd() {
  formModel.value = buildInitialForm()
  dialogTitle.value = `新增${props.title}`
  open.value = true
}

async function handleEdit(row) {
  dialogTitle.value = `修改${props.title}`
  const response = props.api.get
    ? await props.api.get(row[props.idField])
    : { data: row }
  formModel.value = {
    ...buildInitialForm(),
    ...(response.data || response)
  }
  open.value = true
}

async function handleDelete(row) {
  const ids = row ? [row[props.idField]] : selectedIds.value
  if (!ids.length) return
  await ElMessageBox.confirm(`确认删除选中的 ${props.title} 数据吗？`, '提示', { type: 'warning' })
  await props.api.remove(ids.join(','))
  ElMessage.success('删除成功')
  getList()
}

async function submitForm() {
  const payload = { ...formModel.value }
  if (payload[props.idField]) {
    await props.api.update(payload)
    ElMessage.success('修改成功')
  } else {
    await props.api.add(payload)
    ElMessage.success('新增成功')
  }
  open.value = false
  getList()
}

function buildInitialQuery() {
  const query = { pageNum: 1, pageSize: 10 }
  for (const field of props.filters || []) {
    query[field.prop] = field.default ?? undefined
  }
  return query
}

function buildInitialForm() {
  const form = {}
  for (const field of props.formFields || []) {
    if (field.default !== undefined) {
      form[field.prop] = field.default
    } else if (field.type === 'switch') {
      form[field.prop] = field.activeValue ?? true
    } else {
      form[field.prop] = field.type === 'number' ? 0 : ''
    }
  }
  return form
}

function formatSelect(value, options = []) {
  const match = options.find(item => item.value === value)
  return match ? match.label : formatPlain(value)
}

function formatPlain(value) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }
  return Array.isArray(value) ? value.join('、') : value
}

getList()
</script>
