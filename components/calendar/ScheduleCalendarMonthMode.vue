<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div class="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div v-for="day in weekdayHeaders" :key="day" class="border-r border-slate-200 px-2 py-2 last:border-r-0">{{ day }}</div>
    </div>

    <div class="grid grid-cols-7">
      <div
        v-for="day in monthGrid"
        :key="day.toISOString()"
        class="min-h-32 border-b border-r border-slate-100 p-2 text-xs last:border-r-0"
        :class="isSameMonth(day, activeDate) ? 'bg-white' : 'bg-slate-50 text-slate-400'"
      >
        <p class="mb-2 flex items-center justify-between">
          <span class="font-medium">{{ day.getDate() }}</span>
          <span v-if="isToday(day)" class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Today</span>
        </p>
        <ul class="space-y-1">
          <li v-for="shift in (shiftsByDayKey[dayKey(day)] ?? []).slice(0, 3)" :key="shift.id">
            <button
              type="button"
              :disabled="readonly"
              class="w-full truncate rounded border px-2 py-1 text-left"
              :class="readonly ? 'cursor-default text-slate-700' : 'text-slate-700 hover:bg-indigo-50'"
              :style="{ backgroundColor: shift.color ?? '#e2e8f0', borderColor: shift.color ?? '#cbd5e1' }"
              @click="emit('shiftSelect', shift)"
            >
              {{ formatHourMinute(shift.start) }} {{ shift.title }}
            </button>
          </li>
          <li v-if="(shiftsByDayKey[dayKey(day)] ?? []).length > 3" class="text-[11px] text-slate-500">
            +{{ (shiftsByDayKey[dayKey(day)] ?? []).length - 3 }} more
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Shift } from '../../@types/shift'

defineProps<{
  weekdayHeaders: string[]
  monthGrid: Date[]
  activeDate: Date
  readonly: boolean
  shiftsByDayKey: Record<string, Shift[]>
  dayKey: (date: Date) => string
  formatHourMinute: (isoDate: string) => string
  isSameMonth: (left: Date, right: Date) => boolean
  isToday: (date: Date) => boolean
}>()

const emit = defineEmits<{
  shiftSelect: [Shift]
}>()
</script>
