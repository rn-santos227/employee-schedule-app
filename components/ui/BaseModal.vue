<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
    @click.self="handleBackdrop"
  >
    <div
      class="w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200"
      :class="sizeClass"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? titleId : undefined"
    >
      <div class="flex items-start gap-3 border-b border-slate-100 px-6 pb-4 pt-5">
        <div class="flex-1">
          <p v-if="title" :id="titleId" class="text-lg font-semibold text-slate-900">
            {{ title }}
          </p>
          <p v-if="description" class="mt-1 text-sm text-slate-600">
            {{ description }}
          </p>
        </div>
        <button
          type="button"
          class="text-slate-400 transition hover:text-slate-600"
          aria-label="Close modal"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>
      <div class="px-6 py-5">
        <slot />
      </div>
      <div v-if="$slots.footer" class="border-t border-slate-100 px-6 py-4">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ModalSize } from '../../composables/useModal'

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    size?: ModalSize
    closeOnBackdrop?: boolean
  }>(),
  {
    title: '',
    description: '',
    size: 'md',
    closeOnBackdrop: true
  }
)

const emit = defineEmits<{
  (event: 'close'): void
}>()

const titleId = computed(() =>
  `modal-title-${props.title.toLowerCase().replace(/\s+/g, '-') || 'content'}`
)

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'max-w-md'
    case 'lg':
      return 'max-w-3xl'
    case 'xl':
      return 'max-w-5xl'
    default:
      return 'max-w-xl'
  }
})

const handleBackdrop = () => {
  if (!props.closeOnBackdrop) {
    return
  }

  emit('close')
}
</script>
