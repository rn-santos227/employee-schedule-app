<template>
  <BaseModal :title="modalTitle" :description="modalDescription" @close="emit('close')">
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
        {{ rangeLabel }}
      </div>
      <p v-if="errors.start || errors.end" class="text-sm text-rose-600">
        {{ errors.start || errors.end }}
      </p>

      <BaseTextField
        v-model="form.title"
        label="Shift name"
        placeholder="Morning shift"
        :error="errors.title"
        required
      />
      <BaseTextArea
        v-model="form.notes"
        label="Notes"
        placeholder="Optional handoff notes"
        :error="errors.notes"
      />
    </form>

    <template #footer>
      <div class="flex flex-wrap justify-between gap-3">
        <BaseButton v-if="isEditing" variant="danger" @click="emit('delete')">Delete</BaseButton>
        <div class="ml-auto flex gap-3">
          <BaseButton variant="secondary" @click="emit('close')">Cancel</BaseButton>
          <BaseButton variant="primary" @click="handleSubmit">Save shift</BaseButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import type { Shift } from '../../@types/shift'
import { useShiftForm } from '../../composables/useShiftForm'
import BaseButton from '../ui/BaseButton.vue'
import BaseModal from '../ui/BaseModal.vue'
import BaseTextArea from '../ui/BaseTextArea.vue'
import BaseTextField from '../ui/BaseTextField.vue'

const props = defineProps<{
  shift?: Shift
  start: string
  end: string
}>()

const emit = defineEmits<{
  close: []
  save: [{ title: string; notes?: string }]
  delete: []
}>()

const {
  form,
  errors,
  isEditing,
  reset,
  validate,
  payload
} = useShiftForm({
  shift: props.shift,
  start: props.start,
  end: props.end
})

const modalTitle = computed(() => (isEditing.value ? 'Update shift' : 'Create shift'))
const modalDescription = computed(() =>
  isEditing.value ? 'Adjust the details for this scheduled shift.' : 'Name this shift before saving it.'
)

const rangeLabel = computed(() => {
  const start = new Date(props.start)
  const end = new Date(props.end)

  return `${start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })} • ${start.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} - ${end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  })}`
})

const handleSubmit = () => {
  if (!validate()) {
    return
  }

  emit('save', payload.value)
}

watch(
  () => [props.shift, props.start, props.end],
  () => {
    reset({
      shift: props.shift,
      start: props.start,
      end: props.end
    })
  },
  { immediate: true }
)
</script>
