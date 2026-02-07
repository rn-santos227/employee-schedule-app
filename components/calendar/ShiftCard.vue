<template>
  <button
    type="button"
    class="absolute left-1 right-1 overflow-hidden rounded-md border px-2 py-1 text-left text-[11px] shadow-sm"
    :class="[
      props.readonly
        ? 'cursor-default'
        : 'cursor-grab hover:ring-2 hover:ring-indigo-200 active:cursor-grabbing',
      isDragging ? 'cursor-grabbing' : ''
    ]"
    :style="style"
    @mousedown.stop.prevent="handleDragStart"
    :disabled="props.readonly"
    @click.stop="emit('select', shift)"
    @dragstart.prevent
    draggable="false"
  >
    <p class="truncate font-semibold text-slate-900">{{ shift.title }}</p>
    <p class="truncate text-slate-700">{{ shift.employeeName }}</p>
    <p class="truncate text-slate-600">{{ displayedTimeRange }}</p>

    <span
      class="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize bg-slate-900/20"
      title="Resize shift"
      @mousedown.stop.prevent="handleResizeStart"
    />
  </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Shift } from '../../@types/shift'
import { getMinutesInTimeZoneDay, normalizeTimeZone } from '../../utils/timezone'

type DragMode = 'move' | 'resize'

const props = defineProps<{
  shift: Shift
  dayHeight: number
  readonly?: boolean
  timeZone?: string
  displayStart?: string
  displayEnd?: string
  allowHorizontalMove?: boolean
}>()

const emit = defineEmits<{
  select: [Shift]
  update: [Shift, { start: string; end: string }]
}>()

const resolvedTimeZone = computed(() => normalizeTimeZone(props.timeZone))
const effectiveStart = computed(() => new Date(props.displayStart ?? props.shift.start))
const effectiveEnd = computed(() => new Date(props.displayEnd ?? props.shift.end))
const isDragging = ref(false)

const style = computed(() => {
  const top = (getMinutesInTimeZoneDay(effectiveStart.value, resolvedTimeZone.value) / (24 * 60)) * props.dayHeight
  const durationMinutes = Math.max(30, (effectiveEnd.value.getTime() - effectiveStart.value.getTime()) / 60000)
  const height = (durationMinutes / (24 * 60)) * props.dayHeight

  return {
    top: `${top}px`,
    height: `${height}px`,
    backgroundColor: props.shift.color ?? '#dbeafe',
    borderColor: props.shift.color ?? '#bfdbfe'
  }
})

const startInteraction = (event: MouseEvent, mode: DragMode) => {
  if (props.readonly) {
    return
  }

  if (event.button !== 0) {
    return
  }

  const startY = event.clientY
  const startX = event.clientX
  const initialStart = new Date(props.shift.start)
  const initialEnd = new Date(props.shift.end)
  const initialDurationMinutes = Math.max(30, (initialEnd.getTime() - initialStart.getTime()) / 60000)
  isDragging.value = mode === 'move'
  const columnWidth = event.currentTarget instanceof HTMLElement ? event.currentTarget.parentElement?.getBoundingClientRect().width ?? 0 : 0

  const onMove = (moveEvent: MouseEvent) => {
    const deltaY = moveEvent.clientY - startY
    const minuteDelta = Math.round((deltaY / props.dayHeight) * 24 * 60 / 15) * 15
    const dayDelta =
      mode === 'move' && props.allowHorizontalMove && columnWidth > 0
        ? (() => {
            const rawDelta = (moveEvent.clientX - startX) / columnWidth
            return rawDelta >= 0 ? Math.floor(rawDelta) : Math.ceil(rawDelta)
          })()
        : 0

    if (mode === 'move') {
      const nextStart = new Date(initialStart)
      nextStart.setMinutes(nextStart.getMinutes() + minuteDelta + dayDelta * 24 * 60)

      const nextEnd = new Date(nextStart)
      nextEnd.setMinutes(nextStart.getMinutes() + initialDurationMinutes)

      emit('update', props.shift, {
        start: nextStart.toISOString(),
        end: nextEnd.toISOString()
      })
      return
    }

    const nextEnd = new Date(initialEnd)
    nextEnd.setMinutes(nextEnd.getMinutes() + minuteDelta)

    if (nextEnd.getTime() - initialStart.getTime() < 30 * 60 * 1000) {
      return
    }

    emit('update', props.shift, {
      start: initialStart.toISOString(),
      end: nextEnd.toISOString()
    })
  }

  const onUp = () => {
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
    isDragging.value = false
  }

  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

const handleDragStart = (event: MouseEvent) => {
  startInteraction(event, 'move')
}

const handleResizeStart = (event: MouseEvent) => {
  startInteraction(event, 'resize')
}

const formatTimeRange = (startIso: string, endIso: string) => {
  const format = (value: string) =>
    new Date(value).toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: resolvedTimeZone.value
    })

  return `${format(startIso)} - ${format(endIso)}`
}

const displayedTimeRange = computed(() => formatTimeRange(effectiveStart.value.toISOString(), effectiveEnd.value.toISOString()))
</script>
