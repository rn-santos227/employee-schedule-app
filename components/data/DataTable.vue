<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex flex-wrap items-center gap-3">
        <div v-if="showSearch" class="relative">
          <input
            v-model="searchTerm"
            type="search"
            :placeholder="searchPlaceholder"
            class="w-64 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>
        <button
          v-if="showColumnToggle"
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600"
          @click="columnPanelOpen = !columnPanelOpen"
        >
          Columns
        </button>
        <div v-if="columnPanelOpen" class="rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg">
          <p class="mb-2 font-semibold text-slate-700">Visible columns</p>
          <div class="space-y-2">
            <label v-for="column in columns" :key="column.key" class="flex items-center gap-2">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                :checked="visibleColumnKeys.has(column.key)"
                @change="toggleColumn(column.key)"
              />
              <span class="text-slate-600">{{ column.label }}</span>
            </label>
          </div>
          <button
            type="button"
            class="mt-3 text-xs font-semibold uppercase tracking-wide text-indigo-600"
            @click="resetColumns"
          >
            Reset columns
          </button>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <slot name="table-actions" />
        <div class="text-sm text-slate-500">
          {{ filteredRows.length }} result{{ filteredRows.length === 1 ? '' : 's' }}
        </div>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead class="bg-slate-50 text-slate-600">
          <tr>
            <th v-if="selectable" class="px-4 py-3">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                :checked="isPageSelected"
                :indeterminate="isPageIndeterminate"
                @change="toggleSelectPage"
              />
            </th>
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              class="px-4 py-3 font-semibold"
              :class="column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'"
              :style="{ width: column.width ?? 'auto' }"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="flex items-center gap-2 font-semibold text-slate-700"
                @click="toggleSort(column.key)"
              >
                <span>{{ column.label }}</span>
                <span class="text-xs">
                  <span v-if="sortKey === column.key && sortDirection === 'asc'">▲</span>
                  <span v-else-if="sortKey === column.key && sortDirection === 'desc'">▼</span>
                  <span v-else>⇅</span>
                </span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
            <th v-if="hasRowActions" class="px-4 py-3 text-right font-semibold text-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-slate-700">
          <tr v-for="row in paginatedRows" :key="rowKeyValue(row)" class="hover:bg-slate-50">
            <td v-if="selectable" class="px-4 py-3">
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                :checked="selectedRowKeys.has(rowKeyValue(row))"
                @change="toggleRowSelection(row)"
              />
            </td>
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              class="px-4 py-3"
              :class="column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                {{ formatCell(row, column) }}
              </slot>
            </td>
            <td v-if="hasRowActions" class="px-4 py-3 text-right">
              <slot name="row-actions" :row="row" />
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="paginatedRows.length === 0" class="px-6 py-10 text-center text-sm text-slate-500">
        No data matches the current filters.
      </div>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2 text-sm text-slate-600">
        <span>Rows per page</span>
        <select
          v-model.number="pageSize"
          class="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 disabled:opacity-50"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>
        <span class="text-sm text-slate-600">Page {{ currentPage }} of {{ pageCount }}</span>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 disabled:opacity-50"
          :disabled="currentPage === pageCount"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useSlots, watch } from 'vue'

type DataTableColumn = {
  key: string
  label: string
  sortable?: boolean
  searchable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string
  format?: (value: unknown, row: Record<string, unknown>) => string
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[]
    rows: Record<string, unknown>[]
    rowKey?: string
    pageSizeOptions?: number[]
    initialPageSize?: number
    showSearch?: boolean
    searchPlaceholder?: string
    showColumnToggle?: boolean
    selectable?: boolean
  }>(),
  {
    rowKey: 'id',
    pageSizeOptions: () => [5, 10, 25, 50],
    initialPageSize: 10,
    showSearch: true,
    searchPlaceholder: 'Search rows...',
    showColumnToggle: true,
    selectable: false
  }
)

const emit = defineEmits<{
  (event: 'update:selectedRowKeys', value: string[]): void
}>()

const slots = useSlots()

const searchTerm = ref('')
const sortKey = ref<string | null>(null)
const sortDirection = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const pageSize = ref(props.initialPageSize)
const columnPanelOpen = ref(false)
const visibleColumnKeys = ref(new Set(props.columns.map((column) => column.key)))
const selectedRowKeys = ref<Set<string>>(new Set())

const visibleColumns = computed(() =>
  props.columns.filter((column) => visibleColumnKeys.value.has(column.key))
)

const hasRowActions = computed(() => Boolean(slots['row-actions']))

const searchableKeys = computed(() =>
  props.columns.filter((column) => column.searchable !== false).map((column) => column.key)
)

const filteredRows = computed(() => {
  if (!props.showSearch || searchTerm.value.trim() === '') {
    return props.rows
  }
  const query = searchTerm.value.trim().toLowerCase()
  return props.rows.filter((row) =>
    searchableKeys.value.some((key) => String(row[key] ?? '').toLowerCase().includes(query))
  )
})

const sortedRows = computed(() => {
  if (!sortKey.value) {
    return filteredRows.value
  }
  const key = sortKey.value
  const direction = sortDirection.value === 'asc' ? 1 : -1
  return [...filteredRows.value].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    if (aValue === bValue) return 0
    if (aValue == null) return -1 * direction
    if (bValue == null) return 1 * direction
    return String(aValue).localeCompare(String(bValue), undefined, { numeric: true }) * direction
  })
})

const pageCount = computed(() => Math.max(1, Math.ceil(sortedRows.value.length / pageSize.value)))

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedRows.value.slice(start, start + pageSize.value)
})

const isPageSelected = computed(() =>
  paginatedRows.value.length > 0 && paginatedRows.value.every((row) => selectedRowKeys.value.has(rowKeyValue(row)))
)

const isPageIndeterminate = computed(() =>
  paginatedRows.value.some((row) => selectedRowKeys.value.has(rowKeyValue(row))) && !isPageSelected.value
)

const rowKeyValue = (row: Record<string, unknown>) => String(row[props.rowKey] ?? '')

const toggleSort = (key: string) => {
  if (sortKey.value !== key) {
    sortKey.value = key
    sortDirection.value = 'asc'
    return
  }
  sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
}

const toggleColumn = (key: string) => {
  if (visibleColumnKeys.value.has(key)) {
    visibleColumnKeys.value.delete(key)
  } else {
    visibleColumnKeys.value.add(key)
  }
  visibleColumnKeys.value = new Set(visibleColumnKeys.value)
}

const resetColumns = () => {
  visibleColumnKeys.value = new Set(props.columns.map((column) => column.key))
}

const formatCell = (row: Record<string, unknown>, column: DataTableColumn) => {
  const value = row[column.key]
  if (column.format) {
    return column.format(value, row)
  }
  return value == null ? '—' : String(value)
}

const toggleRowSelection = (row: Record<string, unknown>) => {
  const key = rowKeyValue(row)
  if (selectedRowKeys.value.has(key)) {
    selectedRowKeys.value.delete(key)
  } else {
    selectedRowKeys.value.add(key)
  }
  selectedRowKeys.value = new Set(selectedRowKeys.value)
  emit('update:selectedRowKeys', [...selectedRowKeys.value])
}

const toggleSelectPage = () => {
  if (isPageSelected.value) {
    paginatedRows.value.forEach((row) => selectedRowKeys.value.delete(rowKeyValue(row)))
  } else {
    paginatedRows.value.forEach((row) => selectedRowKeys.value.add(rowKeyValue(row)))
  }
  selectedRowKeys.value = new Set(selectedRowKeys.value)
  emit('update:selectedRowKeys', [...selectedRowKeys.value])
}

watch([searchTerm, pageSize, () => props.rows], () => {
  currentPage.value = 1
})

watch(currentPage, () => {
  if (currentPage.value > pageCount.value) {
    currentPage.value = pageCount.value
  }
})
</script>
