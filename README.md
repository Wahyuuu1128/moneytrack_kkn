# Buku Kas KKN - Sistem Pelacakan Keuangan Serverless

Aplikasi pencatatan keuangan berbasis web (Progressive Web App/PWA) yang dirancang khusus untuk memudahkan bendahara dan anggota kelompok Kuliah Kerja Nyata (KKN) dalam mengelola arus kas, mencatat pengeluaran, dan memantau sisa saldo secara real-time. 

Proyek ini dibangun menggunakan pendekatan zero-cost infrastructure (tanpa biaya server), memanfaatkan ekosistem Google Workspace sebagai backend dan database, serta GitHub Pages untuk hosting frontend.

## Daftar Fitur Utama

* Dashboard Keuangan: Menampilkan ringkasan total saldo aktif, pemasukan, dan pengeluaran.
* Riwayat Transaksi (CRUD): Sistem Create, Read, Update, dan Delete transaksi secara real-time.
* Pencarian & Filter: Penyaringan data transaksi berdasarkan jenis, nama penanggung jawab (PIC), kategori, atau keterangan.
* Statistik Pengeluaran: Visualisasi data pengeluaran menggunakan grafik berbasis Chart.js.
* Kalkulator Terintegrasi: Fitur utilitas untuk menghitung patungan (split bill) langsung di dalam aplikasi.
* Progressive Web App (PWA): Aplikasi dapat diinstal ke layar utama (Home Screen) smartphone layaknya aplikasi native.
* Mobile-First UI/UX: Desain antarmuka modern menggunakan Tailwind CSS dengan efek glassmorphism yang responsif di berbagai ukuran layar.

## Tech Stack & Arsitektur

Sistem ini memisahkan lapisan klien dan server sepenuhnya:

* Frontend: HTML5, Tailwind CSS (via CDN), Vanilla JavaScript (Fetch API).
* Backend / API: Google Apps Script (RESTful API dengan metode GET dan POST).
* Database: Google Sheets.
* Deployment: GitHub Pages.
* Visualisasi Data: Chart.js.

## Panduan Instalasi & Setup

Untuk menjalankan proyek ini atau melakukan deployment sendiri, ikuti langkah-langkah berikut:

### 1. Setup Database (Google Sheets)
1. Buat Spreadsheet baru di Google Drive.
2. Pada Sheet1, buat header di baris pertama (A1 sampai I1) dengan nama kolom berikut (harus huruf kecil semua):
   id, tanggal, jenis, kategori, nominal, keterangan, pic, timestamp, nota

### 2. Setup Backend API (Google Apps Script)
1. Buka Spreadsheet yang telah dibuat, klik menu Extensions > Apps Script.
2. Hapus seluruh kode bawaan dan salin kode backend CRUD ke dalam Code.gs.
3. Simpan dan klik tombol Deploy > New deployment.
4. Pilih tipe Web app.
5. Setel "Execute as" menjadi "Me" dan "Who has access" menjadi "Anyone".
6. Selesaikan otorisasi Google dan salin Web app URL yang dihasilkan.

### 3. Setup Frontend
1. Clone repositori ini ke komputer lokal.
2. Buka file script.js.
3. Cari variabel konstan SCRIPT_URL di bagian paling atas.
4. Ganti nilainya dengan Web app URL yang telah disalin dari langkah Google Apps Script.
5. Jalankan menggunakan Live Server untuk pengujian lokal.

## Deployment

Aplikasi ini dirancang untuk di-hosting menggunakan layanan statis seperti GitHub Pages:
1. Push seluruh kode (HTML, CSS, JS, manifest, file Service Worker, dan folder asset gambar) ke repository GitHub.
2. Aktifkan fitur GitHub Pages dari menu Settings repository.
3. Aplikasi akan langsung live dan siap diakses serta diinstal di perangkat seluler.

## Keamanan Data & CORS

Untuk menghindari isu Cross-Origin Resource Sharing (CORS) saat Fetch API dari frontend ke Google Apps Script, backend dikonfigurasi untuk merespons dengan ContentService dan Content-Type berformat text/plain saat preflight request, yang kemudian diuraikan kembali sebagai JSON di sisi klien. 

Karena setelan akses API bersifat publik (Anyone), sangat disarankan untuk menjaga kerahasiaan URL aplikasi (Frontend) dan hanya membagikannya kepada anggota internal kelompok KKN.

## Pengembang

Dikembangkan oleh Wahyu Rahmat Ilahi.
