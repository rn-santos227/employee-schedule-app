<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">{{ periodLabel }}</h3>
        <p class="text-sm text-slate-500">{{ readonly ? 'View-only schedule' : 'Scheduling workspace' }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="min-w-56">
          <BaseSelect v-model="selectedTimeZone" :options="timeZoneOptions" label="Timezone" />
        </div>

        <div class="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white">
          <button
            v-for="mode in modes"
            :key="mode"
            type="button"
            class="px-3 py-2 text-sm font-medium transition"
            :class="activeMode === mode ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-50'"
            @click="activeMode = mode"
          >
            {{ modeLabels[mode] }}
          </button>
        </div>

        <div class="inline-flex overflow-hidden rounded-md border border-slate-200 bg-white">
          <button type="button" class="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="goToPrevious">←</button>
          <button type="button" class="border-x border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" @click="goToToday">Today</button>
          <button type="button" class="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50" @click="goToNext">→</button>
        </div>
      </div>
    </div>

    <ScheduleCalendarDayMode
      v-if="activeMode === 'day'"
      :hours="hours"
      :day-shifts="dayShifts"
      :readonly="readonly"
      :header-label="`${formatWeekday(activeDate, selectedTimeZone)}, ${formatMonthDay(activeDate, selectedTimeZone)}`"
      :format-hour="formatHour"
      :drag-preview="dragPreview"
      :time-zone="selectedTimeZone"
      @create-mouse-down="startCreateFromDay"
      @shift-select="emitShift"
      @shift-update="emitShiftUpdate"
    />

    <ScheduleCalendarWeekMode
      v-else-if="activeMode === 'week'"
      :week-days="weekDays"
      :hours="hours"
      :readonly="readonly"
      :shifts="shifts"
      :shifts-by-day-key="shiftsByDayKey"
      :day-key="(date) => dayKey(date, selectedTimeZone)"
      :format-weekday="(date, short) => formatWeekday(date, selectedTimeZone, short)"
      :format-month-day="(date) => formatMonthDay(date, selectedTimeZone)"
      :format-hour="formatHour"
      :drag-preview="dragPreview"
      :time-zone="selectedTimeZone"
      @create-mouse-down="startCreateFromWeek"
      @shift-select="emitShift"
      @shift-update="emitShiftUpdate"
    />

    <ScheduleCalendarMonthMode
      v-else
      :weekday-headers="weekdayHeaders"
      :month-grid="monthGrid"
      :active-date="activeDate"
      :readonly="readonly"
      :shifts-by-day-key="shiftsByDayKey"
      :day-key="(date) => dayKey(date, selectedTimeZone)"
      :format-hour-minute="(isoDate) => formatHourMinute(isoDate, selectedTimeZone)"
      :is-same-month="(left, right) => isSameMonth(left, right, selectedTimeZone)"
      :is-today="(date) => isToday(date, selectedTimeZone)"
      @shift-select="emitShift"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CalendarMode, Shift } from '../../@types/shift'
import { useCalendar } from '../../composables/useCalendar'
import { normalizeTimeZone } from '../../utils/timezone'
import timezoneList from '../../data/tomezones.json'
import BaseSelect from '../ui/BaseSelect.vue'
import ScheduleCalendarDayMode from './ScheduleCalendarDayMode.vue'
import ScheduleCalendarMonthMode from './ScheduleCalendarMonthMode.vue'
import ScheduleCalendarWeekMode from './ScheduleCalendarWeekMode.vue'

const props = withDefaults(
  defineProps<{
    shifts: Shift[]
    readonly?: boolean
    initialMode?: CalendarMode
    defaultTimeZone?: string
  }>(),
  {
    readonly: false,
    initialMode: 'week',
    defaultTimeZone: 'UTC'
  }
)

const emit = defineEmits<{
  shiftClick: [Shift]
  shiftCreate: [{ start: string; end: string }]
  shiftUpdate: [Shift, { start: string; end: string }]
}>()

const selectedTimeZone = ref(normalizeTimeZone(props.defaultTimeZone))
const timeZoneOptions = computed(() => (timezoneList as string[]).map((timeZone) => ({ label: timeZone, value: timeZone })))

const {
  modes,
  modeLabels,
  weekdayHeaders,
  hours,
  activeMode,
  activeDate,
  weekDays,
  monthGrid,
  shiftsByDayKey,
  dayShifts,
  periodLabel,
  goToPrevious,
  goToNext,
  goToToday,
  dayKey,
  formatWeekday,
  formatMonthDay,
  formatHour,
  formatHourMinute,
  isSameMonth,
  isToday,
  toIsoInTimeZone
} = useCalendar({
  shifts: () => props.shifts,
  initialMode: props.initialMode,
  timeZone: selectedTimeZone
})

type DragPreview = {
  startMinutes: number
  endMinutes: number
  baseDate: Date
  dayIndex?: number
}

const dragPreview = ref<DragPreview | null>(null)

const minuteFromClientY = (event: MouseEvent, target: EventTarget | null, dayHeight: number) => {
  const element = target instanceof HTMLElement ? target : null
  if (!element) return 0

  const bounds = element.getBoundingClientRect()
  const relativeY = Math.min(Math.max(event.clientY - bounds.top, 0), bounds.height)
  const rawMinutes = (relativeY / Math.max(bounds.height, dayHeight)) * 24 * 60
  return Math.round(rawMinutes / 15) * 15
}

const attachCreateDrag = (event: MouseEvent, baseDate: Date, dayHeight: number, dayIndex?: number) => {
  if (props.readonly) {
    return
  }

  const anchorMinutes = minuteFromClientY(event, event.currentTarget, dayHeight)
  dragPreview.value = {
    startMinutes: anchorMinutes,
    endMinutes: anchorMinutes + 60,
    baseDate,
    dayIndex
  }

  const onMove = (moveEvent: MouseEvent) => {
    const moveMinutes = minuteFromClientY(moveEvent, event.currentTarget, dayHeight)
    const startMinutes = Math.max(0, Math.min(anchorMinutes, moveMinutes))
    const endMinutes = Math.min(24 * 60, Math.max(anchorMinutes, moveMinutes + 15))

    dragPreview.value = {
      startMinutes,
      endMinutes,
      baseDate,
      dayIndex
    }
  }

  const onUp = () => {
    if (!dragPreview.value) {
      return
    }

    emit('shiftCreate', {
      start: toIsoInTimeZone(baseDate, dragPreview.value.startMinutes),
      end: toIsoInTimeZone(baseDate, Math.max(dragPreview.value.startMinutes + 30, dragPreview.value.endMinutes))
    })

    dragPreview.value = null
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const startCreateFromDay = (event: MouseEvent) => {
  if (event.target !== event.currentTarget) {
    return
  }

  attachCreateDrag(event, activeDate.value, 960)
}

const startCreateFromWeek = (event: MouseEvent, day: Date, dayIndex: number) => {
  if (event.target !== event.currentTarget) {
    return
  }

  attachCreateDrag(event, day, 720, dayIndex)
}

const emitShift = (shift: Shift) => {
  if (props.readonly) {
    return
  }

  emit('shiftClick', shift)
}

const emitShiftUpdate = (shift: Shift, patch: { start: string; end: string }) => {
  if (props.readonly) {
    return
  }

  emit('shiftUpdate', shift, patch)
}
</script>
