<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      fullWidth ? 'w-full' : 'w-auto',
      disabled ? 'opacity-60 cursor-not-allowed' : ''
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    fullWidth?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    fullWidth: false
  }
)

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-3 text-base'
}

const variantClasses: Record<'primary' | 'secondary' | 'ghost' | 'danger', string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700'
}

</script>
