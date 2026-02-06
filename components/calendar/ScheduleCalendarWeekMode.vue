<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div class="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="px-2 py-2">Time</div>
      <div v-for="day in weekDays" :key="day.toISOString()" class="border-l border-slate-200 px-2 py-2">
        <p>{{ formatWeekday(day, true) }}</p>
        <p class="text-[11px] font-normal normal-case tracking-normal text-slate-600">{{ formatMonthDay(day) }}</p>
      </div>
    </div>

    <div class="relative h-[720px]">
      <div class="absolute inset-0 grid grid-cols-[4rem_repeat(7,minmax(0,1fr))]">
        <template v-for="hour in hours" :key="`week-${hour}`">
          <div class="border-r border-slate-100 px-1 text-[10px] text-slate-400">{{ formatHour(hour) }}</div>
          <div class="col-span-7 border-t border-slate-100" />
        </template>
      </div>

      <div class="absolute inset-y-0 left-[4rem] right-0 grid grid-cols-7">
        <div
          v-for="(day, index) in weekDays"
          :key="`col-${day.toISOString()}`"
          class="relative border-l border-slate-100"
          @mousedown="emit('createMouseDown', $event, day, index)"
        >
          <ShiftCard
            v-for="shift in shiftsByDayKey[dayKey(day)] ?? []"
            :key="shift.id"
            :shift="shift"
            :day-height="720"
            :readonly="readonly"
            @select="emit('shiftSelect', $event)"
            @update="(shift, patch) => emit('shiftUpdate', shift, patch)"
          />

          <div
            v-if="dragPreview && dragPreview.dayIndex === index"
            class="absolute left-1 right-1 rounded-md border border-dashed border-indigo-500 bg-indigo-100/60"
            :style="dragPreviewStyle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Shift } from '../../@types/shift'
import ShiftCard from './ShiftCard.vue'

type DragPreview = {
  startMinutes: number
  endMinutes: number
  dayIndex?: number
}

const props = defineProps<{
  weekDays: Date[]
  hours: number[]
  readonly: boolean
  shiftsByDayKey: Record<string, Shift[]>
  dayKey: (date: Date) => string
  formatWeekday: (date: Date, short?: boolean) => string
  formatMonthDay: (date: Date) => string
  formatHour: (hour: number) => string
  dragPreview: DragPreview | null
}>()

const emit = defineEmits<{
  createMouseDown: [MouseEvent, Date, number]
  shiftSelect: [Shift]
  shiftUpdate: [Shift, { start: string; end: string }]
}>()

const dragPreviewStyle = computed(() => {
  if (!props.dragPreview) {
    return {}
  }

  const top = (props.dragPreview.startMinutes / (24 * 60)) * 720
  const height = ((props.dragPreview.endMinutes - props.dragPreview.startMinutes) / (24 * 60)) * 720

  return {
    top: `${top}px`,
    height: `${Math.max(12, height)}px`
  }
})
</script>
