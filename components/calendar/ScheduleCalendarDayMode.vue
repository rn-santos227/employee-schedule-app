<template>
  <div class="overflow-hidden rounded-lg border border-slate-200 bg-white">
    <div class="grid grid-cols-[5rem_1fr] border-b border-slate-100 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      <div>Time</div>
      <div>{{ headerLabel }}</div>
    </div>
    <div class="relative h-[960px]">
      <div class="absolute inset-0 grid grid-cols-[5rem_1fr]">
        <template v-for="hour in hours" :key="`day-${hour}`">
          <div class="border-r border-slate-100 px-2 text-xs text-slate-400">{{ formatHour(hour) }}</div>
          <div class="border-t border-slate-100" />
        </template>
      </div>

      <div class="absolute inset-y-0 left-[5rem] right-0" @mousedown="emit('createMouseDown', $event)">
        <div
          v-if="showCurrentTimeIndicator"
          class="pointer-events-none absolute left-0 right-0 flex items-center text-indigo-600"
          :style="{ top: `${currentTimeTop}px` }"
        >
          <span class="-ml-1 h-2 w-2 rounded-full bg-indigo-600" />
          <span class="ml-2 h-px flex-1 bg-indigo-600/70" />
        </div>

        <ShiftCard
          v-for="shift in dayShifts"
          :key="shift.id"
          :shift="shift"
          :day-height="960"
          :readonly="readonly"
          :time-zone="timeZone"
          @select="emit('shiftSelect', $event)"
          @update="(shift, patch) => emit('shiftUpdate', shift, patch)"
        />

        <div
          v-if="dragPreview"
          class="absolute left-2 right-2 rounded-md border border-dashed border-indigo-500 bg-indigo-100/60"
          :style="dragPreviewStyle"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Shift } from '../../@types/shift'
import { getMinutesInTimeZoneDay } from '../../utils/timezone'
import ShiftCard from './ShiftCard.vue'

type DragPreview = {
  startMinutes: number
  endMinutes: number
}

const props = defineProps<{
  hours: number[]
  dayShifts: Shift[]
  readonly: boolean
  headerLabel: string
  activeDate: Date
  formatHour: (hour: number) => string
  dragPreview: DragPreview | null
  timeZone: string
  isToday: (date: Date) => boolean
}>()

const emit = defineEmits<{
  createMouseDown: [MouseEvent]
  shiftSelect: [Shift]
  shiftUpdate: [Shift, { start: string; end: string }]
}>()

const currentTime = ref(new Date())
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    currentTime.value = new Date()
  }, 60 * 1000)
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

const showCurrentTimeIndicator = computed(() => props.isToday(props.activeDate))
const currentTimeTop = computed(() => (getMinutesInTimeZoneDay(currentTime.value, props.timeZone) / (24 * 60)) * 960)

const dragPreviewStyle = computed(() => {
  if (!props.dragPreview) {
    return {}
  }

  const top = (props.dragPreview.startMinutes / (24 * 60)) * 960
  const height = ((props.dragPreview.endMinutes - props.dragPreview.startMinutes) / (24 * 60)) * 960

  return {
    top: `${top}px`,
    height: `${Math.max(12, height)}px`
  }
})
</script>
