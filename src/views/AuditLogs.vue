<script setup>
import { useMainStore } from '@/stores/mainStore'
import { computed, ref } from 'vue'
import { RiHistoryLine } from 'vue-remix-icons'

const store = useMainStore()
const filterAction = ref('')
const filterEntity = ref('')

const logs = computed(() => {
  let res = store.auditLogs
  if (filterAction.value) res = res.filter(l => l.action === filterAction.value)
  if (filterEntity.value) res = res.filter(l => l.entity_type === filterEntity.value)
  return res
})

const uniqueActions = computed(() => {
  return [...new Set(store.auditLogs.map(l => l.action))]
})

const entities = ['room', 'table', 'booking', 'user']

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleString('id-ID')
}

function getChanges(l) {
  let changes = '-'
  if (l.old_value && l.new_value && typeof l.old_value === 'object' && typeof l.new_value === 'object') {
    let diffs = []
    for (let k in l.new_value) {
      if (['updated_at', '_deleted'].includes(k)) continue
      if (JSON.stringify(l.old_value[k]) !== JSON.stringify(l.new_value[k])) {
        diffs.push(`${k}: ${l.old_value[k] || 'null'} ➔ ${l.new_value[k] || 'null'}`)
      }
    }
    if (diffs.length) changes = diffs.slice(0, 3).join('<br>')
  } else if (l.action.includes('CREATED') && l.new_value) {
    changes = `<span style="color:var(--brand-700)">Dibuat: ${l.new_value.name || l.new_value.code || l.new_value.booking_code || ''}</span>`
  } else if (l.action.includes('DELETED') && l.old_value) {
    changes = `<span style="color:#DC2626">Dihapus: ${l.old_value.name || l.old_value.code || ''}</span>`
  }
  return changes
}
</script>

<template>
  <div>
    <div class="page-header">
      <div class="page-header-left">
        <div class="page-header-icon">
          <RiHistoryLine />
        </div>
        <div>
          <div class="page-title-wrap">
            <span class="page-title">Log Aktivitas</span>
            <span class="page-count-badge">{{ logs.length }}</span>
          </div>
          <div class="page-subtitle">Log aktivitas sistem</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <select class="form-select" v-model="filterAction" style="width:160px;padding:6px 10px;font-size:12px">
          <option value="">Semua Aksi</option>
          <option v-for="a in uniqueActions" :key="a" :value="a">{{ a.replace(/_/g, ' ') }}</option>
        </select>
        <select class="form-select" v-model="filterEntity" style="width:130px;padding:6px 10px;font-size:12px">
          <option value="">Semua Entitas</option>
          <option v-for="e in entities" :key="e" :value="e">{{ e }}</option>
        </select>
      </div>
    </div>
    
    <div class="card">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Aktor</th>
              <th>Aksi</th>
              <th>Entitas</th>
              <th>Perubahan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="logs.length === 0">
              <td colspan="5"><div class="empty-state"><h3>Belum ada log aktivitas</h3></div></td>
            </tr>
            <tr v-for="l in logs.slice(0, 100)" :key="l.id">
              <td style="font-size:12px;white-space:nowrap;color:var(--text-muted)">{{ formatTime(l.created_at) }}</td>
              <td><strong>{{ l.actor_name }}</strong></td>
              <td style="font-size:12px;font-weight:600">{{ l.action }}</td>
              <td>{{ l.entity_type }}</td>
              <td style="font-family:monospace;font-size:11px" v-html="getChanges(l)"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
