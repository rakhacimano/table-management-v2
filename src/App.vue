<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMainStore } from '@/stores/mainStore'
import { Toaster } from 'vue-sonner'

const router = useRouter()
const route = useRoute()
const store = useMainStore()

onMounted(async () => {
  await store.loadAllData()
})

const isSidebarHidden = computed(() => {
  const customerMode = store.currentPersona.id === 'customer'
  return customerMode && route.name !== 'customer-booking' && route.name !== 'floor-plan'
})

const isAdmin = computed(() => {
  return ['owner', 'admin', 'manager'].includes(store.currentPersona.id)
})

const isCustomer = computed(() => {
  return store.currentPersona.id === 'customer'
})

const pendingBookingsCount = computed(() => {
  return store.bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length
})

const navigate = (name) => {
  router.push({ name })
}

const showPersonaDropdown = ref(false)

const togglePersonaDropdown = (e) => {
  if (e) e.stopPropagation()
  showPersonaDropdown.value = !showPersonaDropdown.value
}

const selectPersona = (id) => {
  store.setPersona(id)
  showPersonaDropdown.value = false
  if (id === 'customer') {
    navigate('floor-plan')
  } else {
    navigate('dashboard')
  }
}
</script>

<template>
  <Toaster position="top-center" richColors />
  <div class="app-shell" @click="showPersonaDropdown = false">
    <!-- SIDEBAR -->
    <aside class="sidebar" id="sidebar" v-if="!isCustomer">
      <div class="sidebar-logo">
        <div class="logo-icon">M</div>
        <span class="logo-text">Mejaaa</span>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section">
          <div class="sidebar-section-label">Ringkasan</div>
          <a class="nav-item" :class="{ active: route.name === 'dashboard' }" @click="navigate('dashboard')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span class="nav-text">Dasbor</span>
          </a>
          <a class="nav-item" :class="{ active: route.name === 'customer-booking' }" @click="navigate('customer-booking')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span class="nav-text">Pesan Meja</span>
          </a>
        </div>
        <div class="sidebar-section" v-if="isAdmin">
          <div class="sidebar-section-label">Manajemen</div>
          <a class="nav-item" :class="{ active: route.name === 'rooms' }" @click="navigate('rooms')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            <span class="nav-text">Ruangan</span>
          </a>
          <a class="nav-item" :class="{ active: route.name === 'tables' }" @click="navigate('tables')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
            <span class="nav-text">Meja</span>
          </a>
          <a class="nav-item" :class="{ active: route.name === 'floor-plan' }" @click="navigate('floor-plan')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            <span class="nav-text">Denah Lantai</span>
          </a>
          <a class="nav-item" :class="{ active: route.name === 'bookings' }" @click="navigate('bookings')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span class="nav-text">Reservasi</span>
            <span class="nav-badge" v-if="pendingBookingsCount > 0">{{ pendingBookingsCount }}</span>
          </a>
        </div>
        <div class="sidebar-section" v-if="isAdmin">
          <div class="sidebar-section-label">Sistem</div>
          <a class="nav-item" :class="{ active: route.name === 'audit-logs' }" @click="navigate('audit-logs')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span class="nav-text">Log Aktivitas</span>
          </a>
          <a class="nav-item" :class="{ active: route.name === 'settings' }" @click="navigate('settings')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span class="nav-text">Pengaturan</span>
          </a>
        </div>
      </nav>
      <div class="sidebar-footer dropdown-container" @click="togglePersonaDropdown" style="cursor:pointer;position:relative">
        <div class="avatar" id="current-avatar">{{ store.currentPersona.initials }}</div>
        <div class="user-info">
          <div class="user-name" id="current-user-name">{{ store.currentPersona.name }}</div>
          <div class="user-role" id="current-user-role">{{ store.currentPersona.role }}</div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717A" stroke-width="2" style="margin-left:auto"><polyline points="18 15 12 9 6 15"/></svg>
        <div class="dropdown-menu" :class="{ open: showPersonaDropdown }" style="bottom:100%;left:0;margin-bottom:8px">
          <div v-for="p in store.personas" :key="p.id" class="dropdown-item" :class="{ active: p.id === store.currentPersona.id }" @click="selectPersona(p.id)">
            <div style="display:flex;align-items:center;gap:10px">
              <div class="avatar" style="width:24px;height:24px;font-size:10px">{{ p.initials }}</div>
              <div><div style="line-height:1.2">{{ p.name }}</div><div style="font-size:10px;color:var(--text-muted)">{{ p.role }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN CONTENT -->
    <div class="main-content">
      <header class="topbar" v-if="!isCustomer">
        <div class="topbar-left">
          <span class="topbar-title">{{ String(route.name).toUpperCase() }}</span>
        </div>
        <div class="topbar-right">
          <div class="search-bar" style="width:220px">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="form-input" type="text" placeholder="Search..." style="font-size:12px;padding:6px 12px 6px 32px">
          </div>
        </div>
      </header>
      <div class="page-content" id="page-content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
