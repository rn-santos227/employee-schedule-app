<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div class="grid grid-cols-[4rem_repeat(7,minmax(0,1fr))] border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div class="px-2 py-2">Time</div>
      <div
        v-for="day in weekDays"
        :key="day.toISOString()"
        class="border-l border-slate-200 px-2 py-2"
        :class="isToday(day) ? 'bg-indigo-50/70 text-indigo-800' : ''"
      >
        <p>{{ formatWeekday(day, true) }}</p>
        <p class="text-[11px] font-normal normal-case tracking-normal" :class="isToday(day) ? 'text-indigo-700' : 'text-slate-600'">
          {{ formatMonthDay(day) }}
        </p>
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
          :class="isToday(day) ? 'bg-indigo-50/40' : ''"
          @mousedown="emit('createMouseDown', $event, day, index)"
        >
          <ShiftCard
            v-for="segment in shiftsByWeekDay[dayKey(day)] ?? []"
            :key="`${segment.shift.id}-${dayKey(day)}`"
            :shift="segment.shift"
            :day-height="720"
            :readonly="readonly"
            :time-zone="timeZone"
            :display-start="segment.displayStart"
            :display-end="segment.displayEnd"
            :allow-horizontal-move="true"
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
import { zonedDateTimeToUtc } from '../../utils/timezone'
import ShiftCard from './ShiftCard.vue'

type DragPreview = {
  startMinutes: number
  endMinutes: number
  dayIndex?: number
}

type ShiftSegment = {
  shift: Shift
  displayStart: string
  displayEnd: string
}

const props = defineProps<{
  weekDays: Date[]
  hours: number[]
  readonly: boolean
  shifts: Shift[]
  shiftsByDayKey: Record<string, Shift[]>
  dayKey: (date: Date) => string
  formatWeekday: (date: Date, short?: boolean) => string
  formatMonthDay: (date: Date) => string
  formatHour: (hour: number) => string
  dragPreview: DragPreview | null
  timeZone: string
  isToday: (date: Date) => boolean
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

const shiftsByWeekDay = computed(() => {
  return props.weekDays.reduce<Record<string, ShiftSegment[]>>((acc, day) => {
    const currentDayKey = props.dayKey(day)
    const [year, month, dayOfMonth] = currentDayKey.split('-').map((part) => Number(part))

    if (!year || !month || !dayOfMonth) {
      acc[currentDayKey] = []
      return acc
    }

    const dayStart = zonedDateTimeToUtc(props.timeZone, year, month, dayOfMonth, 0, 0, 0)
    const dayEnd = zonedDateTimeToUtc(props.timeZone, year, month, dayOfMonth + 1, 0, 0, 0)

    const segments = props.shifts
      .map((shift) => {
        const shiftStart = new Date(shift.start)
        const shiftEnd = new Date(shift.end)
        const overlapStart = Math.max(shiftStart.getTime(), dayStart.getTime())
        const overlapEnd = Math.min(shiftEnd.getTime(), dayEnd.getTime())

        if (overlapEnd <= overlapStart) {
          return null
        }

        return {
          shift,
          displayStart: new Date(overlapStart).toISOString(),
          displayEnd: new Date(overlapEnd).toISOString()
        }
      })
      .filter((segment): segment is ShiftSegment => Boolean(segment))
      .sort((left, right) => left.displayStart.localeCompare(right.displayStart))

    acc[currentDayKey] = segments
    return acc
  }, {})
})
</script>
