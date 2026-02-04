<template>
  <div :class="[baseClasses, paddingClasses[padding]]">
    <div v-if="title || subtitle" class="space-y-1">
      <h3 v-if="title" class="text-base font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-slate-500">{{ subtitle }}</p>
    </div>
    <div :class="title || subtitle ? 'mt-4' : ''">
      <slot />
    </div>
    <div v-if="$slots.actions" class="mt-4 flex flex-wrap items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    padding?: 'sm' | 'md' | 'lg'
  }>(),
  {
    title: '',
    subtitle: '',
    padding: 'md'
  }
)

const baseClasses =
  'rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/60'

const paddingClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}
</script>
