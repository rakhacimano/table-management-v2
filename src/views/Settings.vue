<script setup>
import { useMainStore } from '@/stores/mainStore'
import { toast } from 'vue-sonner'

const store = useMainStore()

const exportData = async () => {
  await store.exportData()
  toast.success('Data berhasil diekspor')
}

const resetData = async () => {
  if (confirm('Atur ulang semua data ke default demo?')) {
    await store.resetData()
    toast.success('Data diatur ulang ke default')
  }
}
</script>

<template>
  <div>
    <div class="page-header">
      <div><div class="page-title">Pengaturan</div><div class="page-subtitle">Konfigurasi aplikasi</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card">
        <div class="card-header"><span class="card-title">Aturan Reservasi</span></div>
        <div class="card-body">
          <div class="form-group"><label class="form-label" style="display:flex;align-items:center;">Durasi Default (mnt) <span class="tooltip-icon" data-tooltip="Waktu standar yang dialokasikan untuk reservasi baru (mis. 90 menit).">?</span></label><input class="form-input" value="90" disabled></div>
          <div class="form-group"><label class="form-label" style="display:flex;align-items:center;">Waktu Jeda (mnt) <span class="tooltip-icon" data-tooltip="Waktu jeda setelah reservasi selesai sebelum meja bisa dipesan lagi.">?</span></label><input class="form-input" value="15" disabled></div>
          <div class="form-group"><label class="form-label" style="display:flex;align-items:center;">Waktu Toleransi (mnt) <span class="tooltip-icon" data-tooltip="Waktu toleransi keterlambatan sebelum tamu ditandai sebagai Tidak Hadir.">?</span></label><input class="form-input" value="15" disabled></div>
          <div class="form-group"><label class="form-label" style="display:flex;align-items:center;">Durasi Pembersihan (mnt) <span class="tooltip-icon" data-tooltip="Waktu yang dibutuhkan untuk membersihkan meja setelah tamu pergi.">?</span></label><input class="form-input" value="10" disabled></div>
          <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Pengaturan sudah diprakonfigurasi untuk tujuan demo.</p>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">Manajemen Data</span></div>
        <div class="card-body">
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px;line-height:1.5">Semua data disimpan di IndexedDB peramban Anda. Anda dapat mengekspor atau mengatur ulang ke data demo.</p>
          <div style="display:flex;gap:8px">
            <button class="btn btn-secondary" @click="exportData">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Ekspor JSON
            </button>
            <button class="btn btn-danger" @click="resetData">Atur Ulang Data</button>
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-header"><span class="card-title">Tentang Mejaaa</span></div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.6"><strong>Mejaaa</strong> adalah sistem manajemen meja restoran untuk denah lantai, pemesanan, dan pelacakan status waktu nyata. Dibangun dengan Vue 3, Tailwind CSS, dan Pinia. Data bertahan di IndexedDB (Dexie) — tidak diperlukan backend.</p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Versi 2.0 · Vue 3 Migration</p>
      </div>
    </div>
  </div>
</template>
