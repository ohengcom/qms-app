<template>
  <el-dialog
    :model-value="modelValue"
    title="Add New Quilt"
    width="50%"
    @update:model-value="$emit('update:modelValue', $event)"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-form-item label="Item Number" prop="item_number">
        <el-input-number v-model="form.item_number" :min="1" />
      </el-form-item>
      <el-form-item label="Name" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Season" prop="season">
        <el-select v-model="form.season" placeholder="Select season">
          <el-option label="Winter" value="winter" />
          <el-option label="Spring/Autumn" value="spring_autumn" />
          <el-option label="Summer" value="summer" />
        </el-select>
      </el-form-item>
      <el-form-item label="Weight (grams)" prop="weight_grams">
        <el-input-number v-model="form.weight_grams" :min="0" />
      </el-form-item>
      <el-form-item label="Location" prop="location">
        <el-input v-model="form.location" />
      </el-form-item>
       <el-form-item label="Length (cm)" prop="length_cm">
        <el-input-number v-model="form.length_cm" :min="0" />
      </el-form-item>
       <el-form-item label="Width (cm)" prop="width_cm">
        <el-input-number v-model="form.width_cm" :min="0" />
      </el-form-item>
       <el-form-item label="Fill Material" prop="fill_material">
        <el-input v-model="form.fill_material" />
      </el-form-item>
       <el-form-item label="Color" prop="color">
        <el-input v-model="form.color" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="$emit('update:modelValue', false)">Cancel</el-button>
        <el-button type="primary" @click="submitForm">Confirm</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useQuiltsStore } from '@/stores/quilts'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue', 'quilt-added'])

const quiltsStore = useQuiltsStore()
const formRef = ref(null)

const form = reactive({
  item_number: null,
  name: '',
  season: '',
  weight_grams: null,
  location: '',
  length_cm: null,
  width_cm: null,
  fill_material: '',
  color: '',
})

const rules = {
  item_number: [{ required: true, message: 'Please input item number', trigger: 'blur' }],
  name: [{ required: true, message: 'Please input name', trigger: 'blur' }],
  season: [{ required: true, message: 'Please select season', trigger: 'change' }],
}

const resetForm = () => {
  formRef.value.resetFields()
}

const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      quiltsStore.createQuilt(form)
        .then(() => {
          ElMessage.success('Quilt added successfully')
          emit('quilt-added')
        })
        .catch(error => {
          ElMessage.error(error.response?.data?.detail || 'Failed to add quilt')
        })
    }
  })
}
</script>