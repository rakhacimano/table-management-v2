<script setup>
import { useMainStore } from '@/stores/mainStore'
import { computed } from 'vue'

const store = useMainStore()
const bookings = computed(() => store.bookings)

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID')
}
</script>

<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Reservasi</div><div class="page-subtitle">Kelola semua pemesanan meja</div></div>
    </div>
    
    <div class="card">
      <div class="data-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Kode</th><th>Tamu</th><th>Kontak</th><th>Tanggal & Waktu</th><th>Porsi</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="bookings.length === 0">
              <td colspan="6"><div class="empty-state"><h3>Belum ada reservasi</h3></div></td>
            </tr>
            <tr v-for="b in bookings" :key="b.id">
              <td><strong>{{ b.booking_code }}</strong></td>
              <td>{{ b.customer_name }}</td>
              <td>{{ b.customer_phone }}</td>
              <td>{{ b.booking_date }} <span style="color:var(--text-muted)">{{ b.start_time }}</span></td>
              <td>{{ b.party_size }} org</td>
              <td><span class="badge" :class="'badge-' + b.status">{{ b.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
