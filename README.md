<div align="center">
  
  # 🍽️ Mejaaa
  **Sistem Manajemen Restoran & Reservasi Modern**
  
  [![Vue 3](https://img.shields.io/badge/Vue.js-3.0-4FC08D?style=for-the-badge&logo=vue.js)](https://vuejs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Pinia](https://img.shields.io/badge/Pinia-F6D365?style=for-the-badge&logo=vue.js&logoColor=black)](https://pinia.vuejs.org/)
  [![Dexie.js](https://img.shields.io/badge/Dexie.js-Offline_First-0080FF?style=for-the-badge)](https://dexie.org/)

  <p align="center">
    Platform manajemen operasional restoran lengkap dengan <strong>Command Center</strong> cerdas, <strong>Interactive Floor Plan</strong>, dan integrasi reservasi multi-channel (WhatsApp & Kiosk). Dirancang untuk mempercepat alur kerja Host, Pelayan, dan Manajemen.
  </p>
</div>

---

## ✨ Fitur Utama

- 📊 **Command Center Dashboard**  
  Pantau *Key Performance Indicators* (KPI) operasional secara *real-time*. Dilengkapi dengan *Ops Banner* cerdas untuk mengingatkan durasi *cleaning* meja dan status *waiting list*.
- 🗺️ **Interactive Floor Plan**  
  Visualisasi denah restoran secara interaktif. Mendukung fitur *drag-and-drop* untuk mengatur tata letak meja (VIP, Main Dining, Outdoor) dengan kemudahan satu klik untuk mengubah status operasional.
- 📅 **Manajemen Reservasi & Waiting List**  
  Lacak reservasi dari berbagai sumber (*Walk-in*, Kiosk Mandiri, atau *WhatsApp Bot*) secara terpusat. Dilengkapi fitur *assignment* meja yang otomatis menghindari konflik jadwal.
- 👥 **Sistem Peran (Role-Based Access)**  
  Tampilan UI yang otomatis menyesuaikan konteks peran (*Owner*, *Admin*, *Waiter*, *Cleaner*, hingga *Guest/Customer View*).
- ⚡ **Offline-First (Dexie.js)**  
  Menggunakan `IndexedDB` (melalui Dexie.js) memastikan aplikasi tetap sangat cepat dan data tersimpan aman secara lokal di sisi klien, siap digunakan tanpa hambatan latensi.

## 🛠️ Tech Stack

- **Frontend Framework:** Vue 3 (Composition API) + Vite
- **State Management:** Pinia
- **Routing:** Vue Router
- **Database (Local):** Dexie.js (IndexedDB wrapper)
- **Styling:** Vanilla CSS (Modern CSS Variables & Grid/Flexbox) + Animasi Transisi
- **Toast Notifications:** Vue Sonner

## 🚀 Memulai Proyek (Getting Started)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi Mejaaa di lingkungan lokal Anda.

### 1. Prasyarat
Pastikan Anda telah menginstal **Node.js** (versi 18+) di komputer Anda.

### 2. Instalasi

Clone repositori dan instal semua dependensi:

```bash
# Instal dependensi
npm install
```

### 3. Menjalankan Server Pengembangan

```bash
# Jalankan server lokal dengan Vite
npm run dev
```
Aplikasi akan dapat diakses secara *default* melalui `http://localhost:5173`.

### 4. Build untuk Produksi

```bash
# Build aplikasi untuk tahap deployment
npm run build
```

## 📂 Struktur Direktori Utama

```text
src/
├── assets/         # Aset statis dan konfigurasi CSS Global (CSS Variables)
├── components/     # Komponen Vue yang dapat digunakan ulang
├── router/         # Konfigurasi Vue Router (Routing halaman)
├── stores/         # Konfigurasi Pinia dan integrasi skema database Dexie.js
├── views/          # Halaman utama aplikasi (Dashboard, FloorPlan, Bookings, dll)
├── App.vue         # Root layout aplikasi
└── main.js         # Entry point (Inisialisasi Vue, Pinia, dan Router)
```

## 🤝 Kontribusi

Sistem ini didesain sedemikian rupa untuk dapat beradaptasi dengan alur kerja operasional *Food & Beverage* (F&B) modern. Jika Anda ingin menambahkan integrasi baru (seperti *Payment Gateway* atau notifikasi Telegram), silakan eksplorasi lapisan `store` dan ekstensi API.

---

<div align="center">
  Dibuat dengan ❤️ untuk merevolusi manajemen operasional restoran.
</div>
