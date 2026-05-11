<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useMainStore } from '@/stores/mainStore'
import { toast } from 'vue-sonner'
import { RiCloseLine } from 'vue-remix-icons'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps({
  isEmbed: { type: Boolean, default: false }
})

const store = useMainStore()
const isCustomer = computed(() => store.currentPersona.id === 'customer')
const isAdmin = computed(() => ['owner', 'admin', 'manager'].includes(store.currentPersona.id))
const isCleaner = computed(() => store.currentPersona.id === 'cleaner')
const personas = computed(() => store.personas)

const rooms = computed(() => store.rooms)
const selectedRoomId = ref('')
const showPersonaDropdown = ref(false)

function switchPersona(id) {
  store.setPersona(id)
  showPersonaDropdown.value = false
}

onMounted(() => {
  if (rooms.value.length > 0) {
    selectedRoomId.value = rooms.value[0].id
  }
})

watch(rooms, (newRooms) => {
  if (newRooms.length > 0 && !selectedRoomId.value) {
    selectedRoomId.value = newRooms[0].id
  }
})

const currentRoomTables = computed(() => 
  store.tables.filter(t => t.room_id === selectedRoomId.value)
)

// Detail Panel Logic
const selectedDetailTable = ref(null)

const activeBooking = computed(() => {
  if (!selectedDetailTable.value) return null
  return store.bookings.find(b => b.assigned_table_id === selectedDetailTable.value.id && !['cancelled','completed','no_show'].includes(b.status))
})

function onClickTable(t) {
  if (isCustomer.value) return // handled by mousedown
  selectedDetailTable.value = t
}

async function quickChangeStatus(status) {
  if (!selectedDetailTable.value) return
  await store.updateTable(selectedDetailTable.value.id, { status })
  toast.success('Status meja diperbarui')
  
  // Re-fetch object reference so reactivity stays intact
  const updated = store.tables.find(tbl => tbl.id === selectedDetailTable.value.id)
  if (updated) selectedDetailTable.value = updated
}

function roomName(id) {
  const r = rooms.value.find(x => x.id === id)
  return r ? r.name : ''
}

// Dragging Logic
const dragState = ref({
  isDragging: false,
  tableId: null,
  startX: 0,
  startY: 0,
  initialX: 0,
  initialY: 0
})

function onMouseDown(e, t) {
  if (!isAdmin.value) {
    selectedDetailTable.value = t
    return
  }
  
  dragState.value = {
    isDragging: true,
    tableId: t.id,
    startX: e.clientX,
    startY: e.clientY,
    initialX: t.x_position,
    initialY: t.y_position
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  if (!dragState.value.isDragging) return
  const dx = e.clientX - dragState.value.startX
  const dy = e.clientY - dragState.value.startY
  
  const t = store.tables.find(tbl => tbl.id === dragState.value.tableId)
  if (t) {
    t.x_position = dragState.value.initialX + dx
    t.y_position = dragState.value.initialY + dy
  }
}

async function onMouseUp(e) {
  if (!dragState.value.isDragging) return
  dragState.value.isDragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
  
  const t = store.tables.find(tbl => tbl.id === dragState.value.tableId)
  if (t) {
    await store.updateTablePosition(t.id, t.x_position, t.y_position)
  }
}

// Booking Logic
const showBookingModal = ref(false)
const selectedTable = ref(null)
const bookingData = ref({
  customer_name: '',
  customer_phone: '',
  party_size: 2,
  booking_date: new Date().toISOString().split('T')[0],
  start_time: '18:00'
})

function openBookingModal(t) {
  selectedTable.value = t
  showBookingModal.value = true
}

async function submitBooking() {
  if (!bookingData.value.customer_name) {
    toast.error('Nama wajib diisi')
    return
  }
  try {
    await store.createBooking({
      ...bookingData.value,
      assigned_table_id: selectedTable.value.id,
      status: 'confirmed',
      channel: 'customer_kiosk'
    })
    showBookingModal.value = false
    toast.success('Meja berhasil dipesan!')
  } catch(e) {
    toast.error('Gagal memesan meja')
  }
}
</script>

<template>
  <div @click="showPersonaDropdown = false">
    <div class="page-header" v-if="!isEmbed">
      <div>
        <div class="page-title">Denah Lantai</div>
        <div class="page-subtitle">
          <span v-if="!isCustomer">Atur posisi meja dan pantau status restoran</span>
          <span v-else>Pilih ruangan dan meja yang tersedia untuk dipesan</span>
        </div>
      </div>
      <div style="display:flex;gap:12px;align-items:center;">
        <label style="font-size:12px;font-weight:600;color:var(--text-muted)">Pilih Ruangan:</label>
        <select class="form-select" v-model="selectedRoomId" style="width:200px">
          <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>

        <!-- Persona Switcher for Customer Demo -->
        <div class="dropdown-container" v-if="isCustomer" style="position:relative; z-index:100;">
          <button class="btn btn-secondary btn-sm" @click.stop="showPersonaDropdown = !showPersonaDropdown">
            Ganti Peran (Demo)
          </button>
          <div class="dropdown-menu" :class="{ open: showPersonaDropdown }" style="width:200px;right:0;left:auto;top:calc(100% + 4px);bottom:auto;text-align:left;">
            <div v-for="p in personas" :key="p.id" class="dropdown-item" :class="{ active: p.id === 'customer' }" @click="switchPersona(p.id)">
              {{ p.name }} <span style="font-size:10px;color:var(--text-muted)">{{ p.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="floor-plan-container" style="overflow: hidden;">
      <div class="floor-plan-toolbar">
        <select class="form-select" v-model="selectedRoomId" style="width:200px;font-size:12px">
          <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
      </div>
      
      <div class="floor-plan-canvas">
        <!-- Floating Legend -->
        <div class="floating-legend">
          <div class="legend-item"><div class="legend-dot" style="background:var(--status-available)"></div>Tersedia</div>
          <div class="legend-item"><div class="legend-dot" style="background:var(--status-occupied)"></div>Terisi</div>
          <div class="legend-item"><div class="legend-dot" style="background:var(--status-reserved)"></div>Dipesan</div>
          <div class="legend-item"><div class="legend-dot" style="background:var(--status-cleaning)"></div>Dibersihkan</div>
        </div>

        <div v-if="currentRoomTables.length === 0" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:var(--text-muted);">
          Tidak ada meja di ruangan ini.
        </div>
        <div v-for="t in currentRoomTables" :key="t.id" class="floor-table"
             :class="{ 
               'selected': selectedDetailTable?.id === t.id, 
               'draggable': isAdmin, 
               'clickable': !isAdmin && (isCustomer ? t.status === 'available' : true) 
             }"
             :data-shape="t.shape" :data-status="t.status"
             :style="{ 
               left: t.x_position + 'px', 
               top: t.y_position + 'px', 
               width: t.width + 'px', 
               height: t.height + 'px', 
               cursor: isAdmin ? (dragState.isDragging && dragState.tableId === t.id ? 'grabbing' : 'grab') : (isCustomer ? (t.status === 'available' ? 'pointer' : 'not-allowed') : 'pointer') 
             }"
             @mousedown.prevent="onMouseDown($event, t)"
             @click="onClickTable(t)">
          <span class="table-code">{{ t.code }}</span>
          <span class="table-chairs">{{ t.chair_count }} kursi</span>
        </div>
      </div>

      <!-- Detail Panel Overlay - Moved outside scrollable canvas -->
      <Transition name="panel">
        <div class="table-detail-panel" v-if="selectedDetailTable">
          <div class="detail-header">
            <strong style="font-size:15px">{{ selectedDetailTable.code }}</strong>
            <button class="modal-close" @click="selectedDetailTable = null">
              <RiCloseLine size="16" />
            </button>
          </div>
          <div class="detail-body">
            <div class="detail-row"><span class="detail-label">Ruangan</span><span class="detail-value">{{ roomName(selectedDetailTable.room_id) }}</span></div>
            <div class="detail-row"><span class="detail-label">Bentuk</span><span class="detail-value" style="text-transform:capitalize">{{ selectedDetailTable.shape }}</span></div>
            <div class="detail-row"><span class="detail-label">Kursi</span><span class="detail-value">{{ selectedDetailTable.chair_count }}</span></div>
            <div class="detail-row"><span class="detail-label">Kapasitas</span><span class="detail-value">{{ selectedDetailTable.capacity_min }}-{{ selectedDetailTable.capacity_max }}</span></div>
            <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value"><span class="badge" :class="'badge-' + selectedDetailTable.status">{{ selectedDetailTable.status }}</span></span></div>
            
            <div v-if="activeBooking" style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)">
              <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px">RESERVASI SAAT INI</div>
              <div style="font-size:13px;font-weight:600">{{ activeBooking.customer_name }}</div>
              <div style="font-size:12px;color:var(--text-secondary)">{{ activeBooking.party_size }} tamu · {{ activeBooking.start_time }}</div>
            </div>
            
            <div v-if="selectedDetailTable.notes" style="margin-top:8px;font-size:12px;color:var(--text-muted)">Catatan: {{ selectedDetailTable.notes }}</div>
          </div>
          <div class="detail-actions">
            <label class="form-label" style="margin-bottom:4px">Ubah Status</label>
            <select class="form-select" :value="selectedDetailTable.status" @change="e => quickChangeStatus(e.target.value)" style="font-size:12px" :disabled="isCleaner && selectedDetailTable.status !== 'cleaning'">
              <option value="available" :disabled="isCleaner">Tersedia</option>
              <option value="occupied" :disabled="isCleaner">Terisi</option>
              <option value="reserved" :disabled="isCleaner">Dipesan</option>
              <option value="cleaning">Dibersihkan</option>
              <option value="blocked" :disabled="isCleaner">Diblokir</option>
              <option value="out_of_service" :disabled="isCleaner">Rusak</option>
            </select>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Booking Modal for Customer -->
    <BaseModal v-if="isCustomer" v-model="showBookingModal" :title="`Pesan Meja ${selectedTable?.code}`">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Nama Anda *</label>
          <input class="form-input" v-model="bookingData.customer_name" placeholder="cth. Budi">
        </div>
        <div class="form-group">
          <label class="form-label">No. Telepon</label>
          <input class="form-input" v-model="bookingData.customer_phone" placeholder="cth. 0812...">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Jumlah Orang</label>
          <input class="form-input" type="number" v-model.number="bookingData.party_size" :min="1" :max="selectedTable?.capacity_max">
        </div>
        <div class="form-group">
          <label class="form-label">Waktu Kedatangan</label>
          <input class="form-input" type="time" v-model="bookingData.start_time">
        </div>
      </div>
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showBookingModal = false">Batal</button>
        <button type="button" class="btn btn-primary" @click="submitBooking">Konfirmasi Pesanan</button>
      </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.clickable:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}
</style>
