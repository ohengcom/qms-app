<template>
  <div class="settings-page">
    <AppHeader />
    <div class="page-container">
      <h1>Settings</h1>
      <p>This page will contain application settings, such as data import/export.</p>
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>Data Management</span>
        </template>
        <el-upload
          class="upload-demo"
          drag
          action="/api/migration/excel-import"
          :on-success="handleSuccess"
          :on-error="handleError"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Drop Excel file here or <em>click to upload</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              .xlsx/.xls files only
            </div>
          </template>
        </el-upload>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '../components/layout/AppHeader.vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const handleSuccess = (response, file) => {
  ElMessage.success(`${file.name} uploaded successfully. ${response.message}`)
}

const handleError = (error, file) => {
  const message = error.response?.data?.detail || 'File upload failed'
  ElMessage.error(message)
}
</script>