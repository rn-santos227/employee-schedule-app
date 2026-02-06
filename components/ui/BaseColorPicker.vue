<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="text-sm font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-rose-600">*</span>
    </label>

    <div class="flex flex-wrap gap-2">
      <button
        v-for="color in resolvedSwatches"
        :key="color"
        type="button"
        class="h-8 w-8 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        :class="modelValue === color ? 'border-slate-900' : 'border-white shadow-sm hover:border-slate-300'"
        :style="{ backgroundColor: color }"
        :aria-label="`Select ${color}`"
        @click="emit('update:modelValue', color)"
      />

      <label
        class="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs font-medium text-slate-700 transition hover:border-slate-400"
      >
        Custom
        <input :id="inputId" type="color" class="h-6 w-8 cursor-pointer border-0 bg-transparent p-0" :value="modelValue" @input="onInput" />
      </label>
    </div>

    <p v-if="helperText" class="text-sm text-slate-500">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    helperText?: string
    swatches?: string[]
    id?: string
    required?: boolean
  }>(),
  {
    modelValue: '#dbeafe',
    label: '',
    helperText: '',
    swatches: () => ['#dbeafe', '#dcfce7', '#fee2e2', '#fef3c7', '#ede9fe', '#cffafe', '#fce7f3', '#e2e8f0'],
    required: false
  }
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const generatedId = useId()
const inputId = computed(() => props.id ?? `color-picker-${generatedId}`)
const resolvedSwatches = computed(() =>
  props.swatches.length ? props.swatches : ['#dbeafe', '#dcfce7', '#fee2e2', '#fef3c7', '#ede9fe', '#cffafe', '#fce7f3', '#e2e8f0']
)

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>
