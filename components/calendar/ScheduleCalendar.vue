<template>
  <section class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">{{ periodLabel }}</h3>
        <p class="text-sm text-slate-500">{{ readonly ? 'View-only schedule' : 'Scheduling workspace' }}</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
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

    <div v-if="activeMode === 'day'" class="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div class="grid grid-cols-[5rem_1fr] border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <div>Time</div>
        <div>{{ formatWeekday(activeDate) }}, {{ formatMonthDay(activeDate) }}</div>
      </div>
      <div class="relative h-[960px]">
        <div class="absolute inset-0 grid grid-cols-[5rem_1fr]">
          <template v-for="hour in hours" :key="`day-${hour}`">
            <div class="border-r border-slate-100 px-2 text-xs text-slate-400">{{ formatHour(hour) }}</div>
            <div class="border-t border-slate-100" />
          </template>
        </div>

        <div class="absolute inset-y-0 left-[5rem] right-0">
          <button
            v-for="shift in dayShifts"
            :key="shift.id"
            type="button"
            :disabled="readonly"
            class="absolute left-2 right-2 overflow-hidden rounded-md border px-2 py-1 text-left text-xs shadow-sm"
            :class="readonly ? 'cursor-default' : 'hover:ring-2 hover:ring-indigo-200'"
            :style="shiftStyle(shift)"
            @click="emitShift(shift)"
          >
            <p class="truncate font-semibold text-slate-900">{{ shift.title }}</p>
            <p class="truncate text-slate-700">{{ shift.employeeName }}</p>
            <p class="text-slate-600">{{ formatTimeRange(shift.start, shift.end) }}</p>
          </button>
        </div>
      </div>
    </div>

    <div v-else-if="activeMode === 'week'" class="overflow-hidden rounded-lg border border-slate-200 bg-white">
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
          <div v-for="day in weekDays" :key="`col-${day.toISOString()}`" class="relative border-l border-slate-100">
            <button
              v-for="shift in shiftsByDayKey[dayKey(day)] ?? []"
              :key="shift.id"
              type="button"
              :disabled="readonly"
              class="absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-left text-[11px] shadow-sm"
              :class="readonly ? 'cursor-default' : 'hover:ring-2 hover:ring-indigo-200'"
              :style="shiftStyle(shift, 720)"
              @click="emitShift(shift)"
            >
              <p class="truncate font-semibold text-slate-900">{{ shift.title }}</p>
              <p class="truncate text-slate-700">{{ shift.employeeName }}</p>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="overflow-hidden rounded-lg border border-slate-200 bg-white">
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
                @click="emitShift(shift)"
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
  </section>
</template>

<script setup lang="ts">
import type { CalendarMode, Shift } from '../../@types/shift'
import { useCalendar } from '../../composables/useCalendar'

const props = withDefaults(
  defineProps<{
    shifts: Shift[]
    readonly?: boolean
    initialMode?: CalendarMode
  }>(),
  {
    readonly: false,
    initialMode: 'week'
  }
)

const emit = defineEmits<{
  shiftClick: [Shift]
}>()

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
  shiftStyle,
  formatWeekday,
  formatMonthDay,
  formatHour,
  formatHourMinute,
  formatTimeRange,
  isSameMonth,
  isToday
} = useCalendar({
  shifts: () => props.shifts,
  initialMode: props.initialMode
})

const emitShift = (shift: Shift) => {
  if (props.readonly) {
    return
  }

  emit('shiftClick', shift)
}
</script>
