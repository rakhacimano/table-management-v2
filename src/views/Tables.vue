<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '@/stores/mainStore'
import BaseModal from '@/components/ui/BaseModal.vue'
import { toast } from 'vue-sonner'

const store = useMainStore()
const tables = computed(() => store.tables)
const rooms = computed(() => store.rooms)

const filterRoom = ref('')
const filterStatus = ref('')

const filteredTables = computed(() => {
  let res = tables.value
  if (filterRoom.value) res = res.filter(t => t.room_id === filterRoom.value)
  if (filterStatus.value) res = res.filter(t => t.status === filterStatus.value)
  return res
})

function roomName(id) {
  const r = rooms.value.find(r => r.id === id)
  return r ? r.name : 'Unknown'
}

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const formData = ref({
  code: '',
  room_id: '',
  shape: 'square',
  chair_count: 4,
  capacity_min: 2,
  capacity_max: 4,
  notes: ''
})

function openModal(table = null) {
  if (table) {
    isEdit.value = true
    currentId.value = table.id
    formData.value = { ...table }
  } else {
    isEdit.value = false
    currentId.value = null
    formData.value = { code: '', room_id: rooms.value.length ? rooms.value[0].id : '', shape: 'square', chair_count: 4, capacity_min: 2, capacity_max: 4, notes: '' }
  }
  showModal.value = true
}

async function saveTable(e) {
  if (e) e.preventDefault()
  try {
    const codeSafe = String(formData.value.code || '').trim()
    if (!codeSafe || !formData.value.room_id) {
      toast.error('Kode dan ruangan wajib diisi')
      return
    }
    
    const finalData = { ...formData.value, code: codeSafe }
    
    if (isEdit.value) {
      await store.updateTable(currentId.value, finalData)
      toast.success('Meja berhasil diperbarui')
    } else {
      await store.createTable(finalData)
      toast.success('Meja berhasil dibuat')
    }
    showModal.value = false
  } catch (err) {
    console.error(err)
    toast.error('Terjadi kesalahan: ' + err.message)
  }
}

async function deleteTable(id) {
  if (confirm('Apakah Anda yakin ingin menghapus meja ini?')) {
    const res = await store.deleteTable(id)
    if (res && res.error) {
      toast.error(res.error)
    } else {
      toast.success('Meja berhasil dihapus')
    }
  }
}

async function quickStatusChange(id, newStatus) {
  await store.updateTable(id, { status: newStatus })
  toast.success('Status meja diperbarui')
}
</script>

<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Meja</div><div class="page-subtitle">Kelola semua meja makan</div></div>
      <div style="display:flex;gap:8px">
        <select class="form-select" v-model="filterRoom" style="width:160px;padding:6px 10px;font-size:12px">
          <option value="">Semua Ruangan</option>
          <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
        </select>
        <select class="form-select" v-model="filterStatus" style="width:140px;padding:6px 10px;font-size:12px">
          <option value="">Semua Status</option>
          <option value="available">Tersedia</option>
          <option value="occupied">Terisi</option>
          <option value="reserved">Dipesan</option>
          <option value="cleaning">Dibersihkan</option>
          <option value="blocked">Diblokir</option>
          <option value="out_of_service">Rusak</option>
        </select>
        <button class="btn btn-primary" @click="openModal(null)">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Tambah Meja
        </button>
      </div>
    </div>
    
    <div class="card">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode</th><th>Ruangan</th><th>Bentuk</th><th>Kursi</th><th>Kapasitas</th><th>Status</th><th>Catatan</th><th style="width:120px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredTables.length === 0">
              <td colspan="8"><div class="empty-state"><h3>Tidak ada meja</h3></div></td>
            </tr>
            <tr v-for="t in filteredTables" :key="t.id">
              <td><strong>{{ t.code }}</strong></td>
              <td>{{ roomName(t.room_id) }}</td>
              <td style="text-transform:capitalize">{{ t.shape }}</td>
              <td>{{ t.chair_count }}</td>
              <td>{{ t.capacity_min }}-{{ t.capacity_max }}</td>
              <td><span class="badge" :class="'badge-' + t.status">{{ t.status }}</span></td>
              <td style="font-size:12px;color:var(--text-muted);max-width:120px;overflow:hidden;text-overflow:ellipsis">{{ t.notes || '-' }}</td>
              <td>
                <div style="display:flex;gap:4px">
                  <select class="form-select" :value="t.status" @change="e => quickStatusChange(t.id, e.target.value)" style="padding:4px 6px;font-size:11px;width:90px">
                    <option value="available">Tersedia</option>
                    <option value="occupied">Terisi</option>
                    <option value="reserved">Dipesan</option>
                    <option value="cleaning">Dibersihkan</option>
                    <option value="blocked">Diblokir</option>
                    <option value="out_of_service">Rusak</option>
                  </select>
                  <button class="btn btn-ghost btn-sm btn-icon" @click="openModal(t)" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  <button class="btn btn-ghost btn-sm btn-icon" @click="deleteTable(t.id)" title="Hapus"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Meja -->
    <BaseModal v-model="showModal" :title="isEdit ? 'Edit Meja' : 'Buat Meja'">
      <div style="display: flex; gap: 24px;">
        
        <!-- Left: Form -->
        <div style="flex: 1;">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Kode Meja *</label>
              <input class="form-input" v-model="formData.code" placeholder="cth. A01">
            </div>
            <div class="form-group">
              <label class="form-label">Ruangan *</label>
              <select class="form-select" v-model="formData.room_id">
                <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Bentuk</label>
              <select class="form-select" v-model="formData.shape">
                <option v-for="s in ['square','round','rectangle','oval','booth']" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Kursi</label>
              <input class="form-input" type="number" v-model.number="formData.chair_count" min="1">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Kap. Min</label>
              <input class="form-input" type="number" v-model.number="formData.capacity_min" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Kap. Maks</label>
              <input class="form-input" type="number" v-model.number="formData.capacity_max" min="1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Catatan</label>
            <textarea class="form-textarea" v-model="formData.notes" placeholder="Catatan internal"></textarea>
          </div>
        </div>

        <!-- Right: Visualizer -->
        <div style="width: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--border-default);">
          <span style="font-size: 11px; font-weight: 600; color: var(--text-muted); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.5px;">Pratinjau Meja</span>
          
          <div class="floor-table" 
               :data-shape="formData.shape" 
               data-status="available"
               :style="{
                 position: 'relative',
                 width: formData.shape === 'rectangle' ? '120px' : '80px',
                 height: formData.shape === 'rectangle' ? '60px' : '80px',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 boxShadow: 'var(--shadow-md)'
               }">
            <span class="table-code" style="color:#fff; font-weight:700; font-size:12px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">{{ formData.code || '?' }}</span>
            <span class="table-chairs" style="color:rgba(255,255,255,0.85); font-size:10px;">{{ formData.chair_count || 0 }} kursi</span>
          </div>
        </div>
        
      </div>
      
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showModal = false">Batal</button>
        <button type="button" class="btn btn-primary" @click="saveTable">Simpan</button>
      </template>
    </BaseModal>
  </div>
</template>
