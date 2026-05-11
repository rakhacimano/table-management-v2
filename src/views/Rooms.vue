<script setup>
import { ref, computed } from 'vue'
import { useMainStore } from '@/stores/mainStore'
import BaseModal from '@/components/ui/BaseModal.vue'
import { toast } from 'vue-sonner'

const store = useMainStore()
const rooms = computed(() => store.rooms)

const showModal = ref(false)
const isEdit = ref(false)
const currentId = ref(null)
const formData = ref({
  name: '',
  type: 'indoor',
  floor_number: 1,
  status: 'active',
  description: ''
})

function tableCount(roomId) {
  return store.tables.filter(t => t.room_id === roomId).length
}

function openModal(room = null) {
  if (room) {
    isEdit.value = true
    currentId.value = room.id
    formData.value = { ...room }
  } else {
    isEdit.value = false
    currentId.value = null
    formData.value = { name: '', type: 'indoor', floor_number: 1, status: 'active', description: '' }
  }
  showModal.value = true
}

async function saveRoom() {
  if (!formData.value.name.trim()) {
    toast.error('Nama ruangan wajib diisi')
    return
  }
  
  if (isEdit.value) {
    await store.updateRoom(currentId.value, formData.value)
    toast.success('Ruangan diperbarui')
  } else {
    await store.createRoom(formData.value)
    toast.success('Ruangan dibuat')
  }
  showModal.value = false
}

async function deleteRoom(id) {
  if (confirm('Apakah Anda yakin ingin menghapus ruangan ini?')) {
    const res = await store.deleteRoom(id)
    if (res && res.error) {
      toast.error(res.error)
    } else {
      toast.success('Ruangan dihapus')
    }
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Ruangan & Lantai</div><div class="page-subtitle">Kelola area restoran Anda</div></div>
      <button class="btn btn-primary" @click="openModal(null)">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Tambah Ruangan
      </button>
    </div>
    
    <div class="card">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nama</th><th>Tipe</th><th>Lantai</th><th>Meja</th><th>Status</th><th style="width:100px">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="rooms.length === 0">
              <td colspan="6"><div class="empty-state"><h3>Belum ada ruangan</h3></div></td>
            </tr>
            <tr v-for="r in rooms" :key="r.id">
              <td><strong>{{ r.name }}</strong></td>
              <td style="text-transform:capitalize">{{ r.type }}</td>
              <td>{{ r.floor_number }}</td>
              <td>{{ tableCount(r.id) }} meja</td>
              <td><span class="badge" :class="'badge-' + r.status">{{ r.status }}</span></td>
              <td>
                <div style="display:flex;gap:4px">
                  <button class="btn btn-ghost btn-sm btn-icon" @click="openModal(r)" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                  <button class="btn btn-ghost btn-sm btn-icon" @click="deleteRoom(r.id)" title="Hapus"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Ruangan -->
    <BaseModal v-model="showModal" :title="isEdit ? 'Edit Ruangan' : 'Buat Ruangan'">
      <div class="form-group">
        <label class="form-label">Nama Ruangan *</label>
        <input class="form-input" v-model="formData.name" placeholder="cth. Aula Utama">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Tipe</label>
          <select class="form-select" v-model="formData.type">
            <option v-for="t in ['indoor','outdoor','vip','bar','private','other']" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Lantai</label>
          <input class="form-input" type="number" v-model.number="formData.floor_number" min="1">
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Status</label>
        <select class="form-select" v-model="formData.status">
          <option v-for="s in ['active','inactive','maintenance']" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Deskripsi</label>
        <textarea class="form-textarea" v-model="formData.description" placeholder="Deskripsi opsional"></textarea>
      </div>
      
      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showModal = false">Batal</button>
        <button type="button" class="btn btn-primary" @click="saveRoom">Simpan</button>
      </template>
    </BaseModal>
  </div>
</template>
