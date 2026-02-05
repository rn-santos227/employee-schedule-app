<template>
  <div ref="menuRoot" class="relative">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="toggleMenu"
    >
      Menu
      <span class="text-xs" aria-hidden="true">▾</span>
    </button>

    <Transition name="dropdown-slide">
      <div
        v-if="isOpen"
        class="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
        role="menu"
        aria-label="Main menu"
      >
        <NuxtLink
          :to="auth.isAdmin ? ROUTES.adminUsers : ROUTES.employeeSchedule"
          class="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          role="menuitem"
          @click="closeMenu"
        >
          {{ auth.isAdmin ? 'Manage Users' : 'My Schedule' }}
        </NuxtLink>

        <button
          type="button"
          class="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
          role="menuitem"
          @click="handleLogout"
        >
          Sign out
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useAuthStore } from '../../stores/auth'
import { ROUTES } from '../../constants/routes'
import { useLoadingStore } from '../../stores/loading'

const auth = useAuthStore()
const isOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)
const loadingStore = useLoadingStore()

const closeMenu = () => {
  isOpen.value = false
}

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

const handleOutsideClick = (event: MouseEvent) => {
  if (!menuRoot.value) {
    return
  }

  if (event.target instanceof Node && !menuRoot.value.contains(event.target)) {
    closeMenu()
  }
}

const handleLogout = async () => {
  loadingStore.start('Signing you out...')

  try {
    auth.logout()
    closeMenu()
    await navigateTo(ROUTES.login)
  } finally {
    loadingStore.stop()
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>
