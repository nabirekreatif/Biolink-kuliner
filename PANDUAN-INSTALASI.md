# Panduan Instalasi — Bio Link Kuliner (LinkBio Pro edisi Kuliner)

Link Bio Interaktif + Daftar Menu Makanan & Minuman + Keranjang Pesanan via WhatsApp
Frontend (GitHub Pages) ⇄ Google Apps Script (REST API) + Google Sheets + Google Drive

> © Nabire Kreatif — template berlisensi. Berkas `js/config.js` bebas diedit. Berkas lain **disegel**: bila diubah, halaman akan terkunci.

---

## Isi paket

| Berkas | Untuk apa |
|---|---|
| `biolink-kuliner-frontend.zip` | Website (diunggah ke GitHub Pages). `index.html` ada langsung di dalam ZIP, berikut `nk-license.js` (GitHub Pages) dan `nk-license-blogger.js` (untuk tema Blogger). |
| `Kode.gs`, `Notifikasi.gs`, `CRM.gs`, `Migrasi.gs` | Backend. Ditempel ke editor Google Apps Script. |
| `tema-biolink.xml` | Tema Blogger (opsional): beranda blog = Link Bio, `/p/admin.html` = dasbor. File aplikasi tetap dimuat dari GitHub Pages. |
| `PANDUAN-INSTALASI.md` | Panduan ini. |
| `nk-protect.js` | Khusus penjual (Nabire Kreatif), untuk menyegel ulang bila template diedit. Jangan diberikan ke pembeli. |

---

## 1. Pasang backend (Google Apps Script)

1. Buka **https://script.google.com** → **Proyek baru**. Beri nama, misalnya `Bio Link Backend`.
2. Ganti isi `Code.gs` dengan seluruh isi **Kode.gs**. Ganti juga nama berkasnya menjadi `Kode`.
3. Klik **＋ → Skrip** tiga kali untuk membuat `Notifikasi`, `CRM`, dan `Migrasi`. Tempel isi berkas yang sesuai ke masing-masing.
4. Buka **Setelan proyek** (ikon roda gigi) → centang **Tampilkan file manifes "appsscript.json"**. Kembali ke Editor, buka `appsscript.json`, lalu tempel isi **appsscript.json**.
5. Simpan dengan Ctrl+S.
6. Di dropdown fungsi, pilih **`setupAplikasi`** → klik **▶ Jalankan**.
   - Klik **Tinjau izin** → pilih akun Google Anda → **Lanjutan** → **Buka (tidak aman)** → **Izinkan**. Ini normal untuk skrip buatan sendiri.
   - Buka **Log eksekusi**. Di sana tercatat **username `superadmin` dan sandi awal**. Catat sandi itu. Sandi ini hanya muncul di log dan wajib diganti saat login pertama.
   - Setup otomatis membuat folder **📁 Bio Link WebApp** di Drive (berisi database Sheets dan folder gambar), mengisi **data contoh** (12 produk dengan foto, 3 slide, rekening contoh, QRIS contoh), dan memasang pemicu otomatis tiap 1 menit.
   - `setupAplikasi()` aman dijalankan ulang. Fungsi ini hanya menambahkan yang belum ada, tanpa menggandakan data.
7. **Deploy** → **Deployment baru** → ikon roda gigi → **Aplikasi web**:
   - *Jalankan sebagai*: **Saya**
   - *Yang memiliki akses*: **Siapa saja**
   - Klik **Deploy**, lalu **salin URL yang berakhiran `/exec`**.

> ⚠️ Setiap kali kode backend diubah: **Deploy → Kelola deployment → ✏️ Edit → Versi: Versi baru → Deploy**. Jangan membuat "Deployment baru", karena URL-nya akan berubah dan website berhenti tersambung.

---

## 2. Hubungkan frontend

1. Ekstrak `acc-cell-frontend.zip`. **Folder hasil ekstrak itulah folder proyek**: di dalamnya langsung terlihat `index.html`, `css/`, `js/`, dan `assets/`.
2. Buka `js/config.js` dengan Notepad, lalu tempel URL `/exec` di antara tanda kutip:
   ```js
   GAS_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
   NAMA_USAHA: 'Bio Link',
   ```
3. Simpan. Bila `GAS_URL` kosong, website tetap tampil dalam **mode demo** memakai data contoh bawaan.

---

## 3. Unggah ke GitHub Pages (lewat terminal)

> Jangan memakai tombol "Upload files" di web GitHub, karena struktur folder `css/` dan `js/` akan rusak.

1. Pasang Git: https://git-scm.com/download/win (pengaturan bawaan). Buka **PowerShell**.
2. Atur identitas Git (cukup sekali seumur komputer):
   ```bash
   git config --global user.name "Nama Anda"
   git config --global user.email "email-github@anda.com"
   ```
3. Di github.com: **＋ → New repository** → beri nama `acc-cell` → pilih **Public** → **jangan** centang README → **Create**.
4. Masuk ke folder hasil ekstrak (yang berisi `index.html`):
   ```bash
   cd "C:\Users\NamaAnda\Downloads\acc-cell-frontend"
   dir
   ```
   Pastikan `index.html` terlihat di daftar. Bila yang terlihat justru sebuah folder, masuk dulu ke folder itu dengan `cd`.
5. Kirim ke GitHub, satu perintah per baris:
   ```bash
   git init
   git add .
   git commit -m "Upload pertama Bio Link"
   git branch -M main
   git remote add origin https://github.com/USERNAME/acc-cell.git
   git push -u origin main
   ```
   Saat diminta **Password**, tempel **Personal Access Token**, bukan sandi akun GitHub. Buat tokennya di https://github.com/settings/tokens → *Generate new token (classic)* → centang **repo**. Saat token ditempel, layar memang terlihat kosong; itu normal.
6. Di repo GitHub: **Settings → Pages → Deploy from a branch → main → / (root) → Save**. Centang **Enforce HTTPS**.
7. Tunggu 1–2 menit. Website tampil di `https://USERNAME.github.io/acc-cell/`.

**Update berikutnya:**
```bash
git add .
git commit -m "Perbarui"
git push
```
Bila yang tampil masih versi lama, tekan **Ctrl+Shift+R**.

---

## 4. Langkah pertama setelah online

1. Buka **halaman admin tersendiri**: `https://USERNAME.github.io/acc-cell/admin/`. Halaman ini tidak ditautkan dari halaman publik, jadi **simpan sebagai bookmark**. Login sebagai `superadmin` dengan sandi dari Log, lalu ganti sandi saat diminta.
2. **Rekening & QRIS** → ganti semua data **CONTOH** dengan rekening dan QRIS asli toko. Unggah gambar QRIS asli. Ini penting untuk mencegah penipuan.
3. **Cabang & Sosmed** → periksa alamat, nomor WA admin (Nabire 082197649558, Serui 081248245606), dan link Google Maps. Untuk peta mini: Google Maps → Bagikan → Sematkan peta → Salin HTML → tempel.
4. **Admin & Akses** → buat akun **admin_nabire** dan **admin_serui** (isi nomor WA agar ikut menerima notifikasi). Admin cabang hanya bisa mengelola produk cabangnya sendiri.
5. **Produk** → hapus produk contoh atau ganti dengan foto asli. Foto otomatis dikompres sebelum diunggah ke Drive.
6. **Tampilan & Teks → Bagian Link Bio** → setiap bagian link bio (Profil, Slide Hero, Kartu Promo, Tombol Menu, **Slide Produk Pilihan**, Sosial Media, Cabang) bisa digeser naik/turun dengan ▲▼, dinyalakan/dimatikan dengan saklar, dan diubah isinya lewat tombol **Atur**. Klik **Simpan Urutan** setelah mengubah urutan.
   - **Slide Produk Pilihan** menampilkan produk acak (yang tersedia) yang bisa digeser, plus tombol **Lihat semua**. Judul dan jumlahnya diatur lewat **Atur**.
   - **Sosial media** punya 2 gaya: **Tombol lebar** atau **Ikon bulat**. Pilih di **Cabang & Sosmed**, atau lewat **Atur** pada bagian Sosial Media.
   - Menambah sosial media dari HP: pilih platform, lalu cukup ketik **@username** (atau tekan **Tempel**). Tautan lengkap dibuat otomatis dan tampil sebelum disimpan.
7. **Pop-up Promo** dan **Slide Hero** → atur promo. Pop-up bisa dinyalakan atau dimatikan kapan saja.
8. Pasang link website di bio TikTok, Instagram, Facebook, dan WhatsApp Business.

> Di halaman publik, tombol **Menu** (navigasi bawah) membuka semua menu untuk pengunjung: Beranda, Semua Produk, HP Baru, HP Second, Aksesoris, Rekening & QRIS, Servis & Tukar Tambah, Chat Admin, Bagikan, dan sosial media. Katalog punya tombol **Filter** (lokasi toko, kategori, urutan harga/terbaru, sembunyikan stok habis).

---

## 4a. Memakai dasbor dari HP

Dasbor dibuat seperti aplikasi, jadi semua pengaturan bisa diubah lewat HP:
- **Navigasi bawah** (selalu tampil): **Beranda · Produk · Tampilan · Promo · Menu**. Admin outlet melihat Beranda · Produk · Akun · Menu.
- **Menu** membuka semua menu dasbor dalam bentuk kotak (Pop-up, Rekening & QRIS, Cabang & Sosmed, Layanan, WhatsApp, CRM, Admin, Migrasi, Log, Lisensi, Keluar).
- **Bilah atas** menampilkan judul halaman. Tombol **← (kembali)** muncul di setiap sub-halaman, dan ikon kanan atas membuka halaman utama Link Bio (di Blogger: domain blog Anda, `/`).
- **Tampilan** berisi 5 pilihan: Bagian Link Bio, Menu, Header & Navigasi, Warna & Tema, Teks & Label. Setelah selesai, ketuk ← untuk memilih pengaturan berikutnya.
- **Lembar edit** tampil layar penuh. Judul dan tombol **X** ada di atas, **Batal/Simpan** menempel di bawah. Setelah Simpan, lembar tertutup dan daftar di belakangnya langsung diperbarui, jadi Anda bisa langsung mengedit yang lain tanpa memuat ulang browser.
- Di komputer (layar ≥ 1024 px) dasbor tetap memakai menu samping.

## 4d. Layar pembuka & kecepatan

- **Pembukaan pertama** (atau data tersimpan sudah lebih dari 2 menit): layar pembuka penuh menampilkan logo usaha, bilah kemajuan, dan tulisan *Memuat data…*. Bilah bergerak sesuai tahapan yang benar-benar selesai: data dari server, lalu gambar di layar pertama dan huruf. Setelah semuanya siap, halaman tampil utuh dengan efek memudar, tanpa kedip dan tanpa data kosong.
- **Dibuka ulang dalam 2 menit**: langsung tampil dari data tersimpan, tanpa layar pembuka. Pindah halaman juga tidak memunculkan loading lagi.
- **Koneksi lambat**: setelah 6 detik muncul tulisan *Koneksi lambat, masih memuat data…*. Loading tidak berjalan tanpa batas: bila ada data tersimpan, data itu ditampilkan setelah ±10 detik, dan bila tidak ada, setelah ±25 detik muncul *Gagal memuat data* dengan tombol **Coba Lagi**.
- **Dasbor**: layar pembuka tampil sampai sesi login diperiksa dan data dasbor siap. Bila belum login, langsung ke halaman masuk.
- Logo dan warna di layar pembuka mengikuti pengaturan dasbor (setelah kunjungan pertama).
- Lama data dianggap segar diatur lewat `CACHE_SEGAR_DETIK` (bawaan 120 detik).

## 4b. Atur SEMUA tampilan link bio (menu **Tampilan & Teks**)

Template ini bisa dipakai untuk jenis usaha apa pun (toko HP, kuliner, fesyen, jasa, dll). Menu **Tampilan & Teks** punya 5 tab. Setiap tab punya tombol **Simpan**, dan perubahan langsung tampil di link bio. Pengunjung yang sedang membuka situs akan melihatnya paling lambat ±1 menit kemudian.

| Tab | Yang bisa diatur |
|---|---|
| **Bagian Link Bio** | Urutan bagian (▲▼), saklar on/off, dan isi tiap bagian lewat **Atur**: profil, slide promo, kartu promo, tombol menu, slide produk, sosial media, lokasi toko, dan **FAQ (Tanya Jawab)**. |
| **Menu** | Semua menu link bio, yang aktif maupun yang mati. Saklar = tampil/sembunyi di link bio dan lembar Menu. Menu bisa diubah nama, keterangan, dan ikonnya, serta diurutkan. **Tambah Menu** untuk membuat menu sendiri: isi nama, pilih ikon, lalu pilih tujuannya (lihat di bawah). Perubahan langsung tersimpan. |
| **Header & Navigasi** | Saklar header on/off, logo header, dan nama di header. **Tombol di header: maksimal 2 aktif**, dipilih dari semua menu (CS, Install, Mode gelap, Bagikan, Menu, atau menu buatan sendiri). **Tombol navigasi bawah: maksimal 5 aktif**, juga dipilih dari semua menu. Nama dan ikon tiap tombol bisa diganti, ada pratinjau langsung. |
| **Warna & Tema** | 8 pilihan warna cepat, atau atur sendiri 11 warna (tombol utama, teks, latar, kartu, garis, header, harga, tombol WA, tombol sosmed). Ada tombol **Kembalikan bawaan** dan pilihan tema bawaan untuk pengunjung (terang / gelap / ikuti HP). Tombol mode gelap dipasang lewat tab Header & Navigasi dan selalu tersedia di lembar Menu. |
| **Teks & Label** | Semua tulisan katalog dan detail produk: **daftar kategori** (dipisahkan koma), sebutan barang, label spesifikasi (Merek, RAM, Memori, …), tombol pesan, label tersedia/habis, kartu jaminan, dan **pesan WhatsApp otomatis**. Juga teks halaman Rekening, Layanan, Lokasi, footer, dan deskripsi SEO. |

Tips:
- Isi tanda **-** (minus) pada kolom yang punya keterangan "untuk menyembunyikan" bila tulisan itu tidak perlu. Contoh: usaha kuliner bisa menyembunyikan label "RAM" dan "Memori".
- Kosongkan kolom teks untuk kembali ke tulisan bawaan.
- Pengunjung bisa memilih mode gelap/terang sendiri (tombol header/navigasi bila dipasang, atau lewat lembar **Menu**). Pilihannya tersimpan di HP mereka.
- Semua pop-up dan lembar (menu, bagikan, form dasbor) **hanya tertutup lewat tombol X / Batal**. Klik di luar tidak menutupnya, jadi isian tidak hilang tanpa sengaja.

### Menu buatan sendiri (contoh: menu "iPhone")
Buka **Tampilan & Teks → Menu → Tambah Menu**, isi **Nama menu** `iPhone`, pilih ikon, lalu pilih **Tujuan saat diklik**:

| Tujuan | Contoh isian | Hasil |
|---|---|---|
| Halaman di situs | Katalog / Rekening / Layanan / Lokasi / Beranda | Membuka halaman itu |
| Kategori katalog | `HP Baru` | Katalog langsung tersaring kategori itu |
| Cari kata di katalog | `iphone` | Katalog menampilkan hasil pencarian "iphone" |
| Link custom | `#iphone` | Sama dengan mencari "iphone" di katalog |
| Link custom | `contohdomain.com/iphone` | Membuka situs itu di tab baru |

Setelah dibuat, menu tampil di link bio dan lembar Menu, dan bisa dipasang di **navigasi bawah** atau **tombol header** lewat tab Header & Navigasi.

### FAQ (Tanya Jawab)
**Bagian Link Bio → FAQ → Atur**: ubah judul, tambah/hapus/urutkan pertanyaan dan jawaban. Gunakan saklar di daftar bagian untuk menyalakan/mematikan FAQ.

### Lokasi toko lebih dari 2 cabang
Buka **Cabang & Sosmed** → **Tambah**. Nama dan nomor WA wajib diisi; alamat, jam buka, link Maps, dan peta mini boleh diisi menyusul. Cabang baru otomatis muncul di halaman **Lokasi**, filter katalog, pilihan cabang produk, akun admin cabang, dan pilihan "chat cabang". Cabang tidak bisa dihapus bila masih dipakai produk atau akun admin; pindahkan dulu ke cabang lain.

Di link bio, bagian Lokasi menampilkan beberapa cabang beserta tombol **Lihat semua**. Tombol ini membuka halaman **Lokasi Toko** berisi semua cabang dan **kolom pencarian** (bisa mencari berdasarkan nama, kota, atau alamat).

### Halaman Layanan
Menu **Halaman Layanan** → **Tambah Layanan**: isi judul, pilih ikon, deskripsi, dan pesan WhatsApp otomatis (`{cabang}` diganti nama cabang). Layanan bisa diurutkan (▲), disembunyikan, atau dihapus. Judul, subjudul, dan kotak tips halaman diatur di bagian bawah menu yang sama.

### Slide Hero & Pop-up: dengan atau tanpa link
Saat mengedit slide, pilih **Tujuan saat diklik**: halaman di situs (Katalog / Rekening / Layanan / Lokasi), **Link manual (URL)** (misalnya `https://...`, terbuka di tab baru), atau **Tanpa link** (slide hanya gambar).

---

## 4c. Edisi kuliner: fitur khusus

**Data contoh kuliner (bawaan).** Setelah `setupAplikasi()`, link bio langsung berisi:
- judul **"Bio Link"** (ganti di Tampilan & Teks → Bagian Link Bio → Profil);
- 16 menu dalam 4 kategori: Makanan, Minuman, Camilan, Paket Hemat;
- slide promo, pop-up promo, 2 outlet (Nabire & Serui), FAQ, dan rekening/QRIS contoh.

Gambar contoh berupa ilustrasi di `assets/contoh/`. Ganti dengan foto asli dari dasbor → **Produk**.
> Nomor WhatsApp outlet contoh (`0812-0000-0001/2`) **bukan nomor asli**. Ganti di **Cabang & Sosmed** sebelum situs dipromosikan.

**Keranjang pesanan.** Pengunjung bisa menekan **+ Tambah** pada beberapa menu, mengatur jumlah, memilih varian, dan menulis catatan per menu (mis. "tidak pedas"). Setelah itu mereka memilih outlet dan jenis pesanan (**Makan di tempat / Bawa pulang / Diantar** — "Diantar" meminta alamat), lalu menekan **Kirim Pesanan via WhatsApp**. Admin menerima satu pesan berisi rincian, catatan, dan total. Data nama/alamat diingat untuk pesanan berikutnya.
- Atur di **Tampilan & Teks → Teks & Label → Keranjang pesanan**: nyalakan/matikan keranjang (bila mati, tiap menu kembali memakai tombol WhatsApp langsung), teks tombol, jenis pesanan, catatan, dan format pesan WhatsApp.

**Label menu.** Isi kolom **Label** pada produk (mis. *Best Seller*, *Pedas*, *Baru*, *Promo*, *Rekomendasi Chef*, *Khas Papua*). Label tampil sebagai pita berwarna di kartu menu; warnanya otomatis sesuai kata yang dipakai.

**Status outlet otomatis.** Kartu outlet menampilkan **Buka · tutup 22.00** atau **Tutup · buka 08.00** sesuai jam saat ini. Isi jam buka dengan format `08.00 - 22.00 WIT` (WIB/WITA/WIT didukung).

**Ikon aplikasi mengikuti logo.** Bila logo di **Profil** belum diganti, ikon aplikasi (PWA) memakai ikon Nabire Kreatif. Setelah logo diganti, ikon aplikasi, ikon iPhone (*Tambah ke Layar Utama*), dan ikon tab browser otomatis dibuat dari logo itu (gunakan logo persegi agar hasilnya terbaik).
> Pengunjung yang **sudah** memasang aplikasi sebelum logo diganti: Android/Chrome biasanya memperbarui ikon dalam beberapa hari; di iPhone ikon lama tetap sampai aplikasi dihapus dan dipasang ulang. Pemasangan baru langsung memakai logo baru.

**Menu & slide ke kategori.** Menu buatan sendiri dan Slide Hero bisa diarahkan ke **kategori katalog** (mis. "Paket Hemat" → katalog langsung tersaring).

**Dipasang di Blogger?** Unggah juga `nk-license-blogger.js` ke GitHub bersama berkas lain, dan pastikan tema Blogger memuat **`nk-license-blogger.js`** (bukan `nk-license.js`). Versi Blogger tidak menyegel halaman HTML (karena halaman dibuat oleh Blogger), tetapi tetap menyegel semua berkas JS/CSS.

---

## 5. Reset data contoh & reset sandi superadmin (lewat backend)

Keduanya **hanya** bisa dijalankan dari editor Apps Script. Tidak ada tombol di website.

| Kebutuhan | Fungsi yang dijalankan (▶) | Hasil |
|---|---|---|
| Mengisi ulang data contoh | **`jalankanResetDataContoh`** | Menu, slide, rekening, layanan, dan statistik diganti data contoh paket aktif. **Akun admin, outlet, sosmed, dan pengaturan utama tidak diubah.** |
| Pakai data contoh **kuliner** (bawaan) | **`gantiKeDataKuliner`** | 16 menu makanan & minuman, 3 slide promo, 4 layanan (pesan antar, reservasi, catering, kemitraan), 2 outlet, FAQ, serta teks, warna & label kuliner. Akun admin tidak diubah. |
| Pakai data contoh **toko HP** | **`gantiKeDataHP`** | Data contoh konter handphone (katalog HP, servis, tukar tambah). Akun admin tidak diubah. |
| Lupa sandi superadmin | **`resetPasswordSuperadmin`** | Sandi sementara tampil di **Log eksekusi**, semua sesi lama dicabut, dan sandi wajib diganti saat login. |
| Menentukan sendiri sandi sementara | Setelan proyek → **Properti skrip** → tambah `SUPERADMIN_SANDI_BARU` = sandi pilihan, lalu jalankan `resetPasswordSuperadmin` | Properti otomatis dihapus setelah dipakai. |
| Lupa sandi admin cabang | Dasbor superadmin → **Admin & Akses → Reset** | Admin tersebut wajib mengganti sandi saat login. |
| Pemicu hilang / antrean WA macet | **`pasangTrigger`** | Pemicu 1 menit dipasang ulang. |
| Data publik belum berubah | **`bersihkanCache`** | Cache dikosongkan sehingga data langsung dimuat ulang. |

---

## 6. Notifikasi WhatsApp (Fonnte) & Email

1. Daftar di **fonnte.com** → **Device** → scan QR dengan nomor WA toko → salin **token**.
2. Dasbor → **WhatsApp & Notifikasi → ⚙️ Konfigurasi** → tempel token → **Cek Perangkat** (harus `connect`) → **Kirim Tes WA** → nyalakan saklar WhatsApp → **Simpan**. Token disimpan aman di server dan tidak pernah tampil ke pengunjung.
3. Email: nyalakan saklar Email → **Kirim Tes**. Kuota Gmail biasa sekitar 100 email/hari.
4. **Matriks notifikasi otomatis**: atur kejadian mana yang dikirim lewat WA dan/atau email, beserta isi pesannya:
   - Admin login (keamanan)
   - Admin cabang menambah produk
   - Produk ditandai HABIS
   - Pop-up promo dinyalakan
   - Sandi admin direset
   - Ringkasan mingguan setiap Senin pagi (kunjungan, klik WA Nabire vs Serui, produk paling ditanyakan)
5. **📣 Blast WhatsApp** (promo ke pelanggan): pilih sasaran (segmen/tag CRM atau tempel nomor) → **Deteksi Nomor WA** → tulis pesan (`{nama}`, `{toko}`, `{link}`) → pilih batch **10/20/50** dan jeda → **Mulai Blast**. Server tetap mengirim 1 batch per menit walau halaman ditutup.
   - **Tips anti-blokir:** pakai nomor yang sudah lama aktif, mulai dengan batch 10, jeda acak `3-8` detik, tambahkan "Balas STOP untuk berhenti", dan jangan kirim tautan yang sama ke ratusan orang dalam satu jam.

## 7. CRM Kontak

- **Sinkron** otomatis memasukkan tim admin. Pelanggan masuk lewat **Import CSV** (kolom `nama, wa, email, segmen, tag`; ada template) atau **Tambah Kontak**. Nomor 62/+62 otomatis diubah jadi 08, dan kontak ganda dilewati sehingga import aman diulang.
- Kartu KPI bisa diklik sebagai filter: WA terverifikasi, belum dicek, opt-out, duplikat.
- Aksi massal: deteksi WA, beri tag, **Blast ke terpilih**, opt-out/opt-in, gabungkan duplikat, hapus, dan ekspor CSV.
- Kontak **opt-out** tidak pernah ikut blast.

## 8. Migrasi data dari app/katalog lama

Dasbor → **Migrasi Data** → tempel URL spreadsheet lama → pilih data → **Pindai (Dry-run)** → periksa angka → **Jalankan Import**.
- Spreadsheet lama hanya **dibaca**, tidak diubah.
- Kolom dikenali dari nama header, termasuk variasinya: "Nama Produk", "Harga Jual", "Lokasi", "Stok", "Foto", dan lainnya.
- Import ulang tidak membuat data dobel. Jalankan sekali lagi tepat sebelum pindah untuk menangkap data terbaru.
- Gunakan **akun Google yang sama** agar foto Drive lama tetap tampil.
- Tersedia juga **Import produk dari CSV** (ada template).

## 9. Pasang sebagai aplikasi (PWA) & bagikan link

- **Tombol Install** ada di header (bila dipasang di tab Header & Navigasi), di lembar **Menu**, dan di lembar **Bagikan**. Warnanya mengikuti warna utama tema.
  - Android/Chrome: ketuk **Install** → **Pasang**. Tombol **hilang otomatis** setelah aplikasi terpasang, dan tidak tampil saat link bio dibuka dari aplikasi yang sudah terpasang.
  - iPhone: tombol menampilkan petunjuk *Bagikan → Tambah ke Layar Utama*.
- Saat dibuka sebagai aplikasi terpasang, tampilannya seperti APK: **zoom dimatikan** (cubit, ketuk ganda, Ctrl+gulir), tidak ada tarik-untuk-muat-ulang, teks tidak ikut terseleksi saat ditekan lama, ada animasi pindah halaman, dan warna bilah status mengikuti warna header.
- Saat pop-up atau menu terbuka, halaman di belakangnya **tidak ikut tergulir**.
- **Menu → Bagikan** menampilkan:
  - **QR Code** yang bisa dipindai langsung dari layar atau **diunduh** sebagai gambar PNG berbingkai, siap dicetak atau ditempel di toko.
  - Tautan yang bisa **disalin**.
  - Tombol bagikan ke **WhatsApp, Facebook, Telegram, X**, dan aplikasi lain.
- Tombol bagikan di halaman detail produk memakai lembar yang sama, jadi QR-nya langsung membuka produk tersebut.

## 10. Lisensi template (Nabire Kreatif)

- Domain yang belum berlisensi tampil dalam **mode DEMO**: hanya ada **pita merah "DEMO"** di pojok kiri atas. Tidak ada bilah melayang di bawah, dan semua fitur tetap berjalan.
- Cara aktivasi (pilih salah satu):
  - ketuk **pita DEMO**;
  - buka **`domain-anda/#key`**;
  - dasbor → menu **Lisensi**.

  Lalu masukkan kode `NK-XXXX-XXXX`. Cukup **sekali per domain**; setelah itu semua pengunjung tidak diminta kode lagi. Panel aktivasi juga punya tautan **Beli lisensi** ke halaman produk di Nabire Kreatif.
- Setelah berlisensi, **pita DEMO hilang** dan footer menampilkan **"© 2026 <nama usaha>. by Nabirekreatif.com"** (nama usaha diambil dari profil di dasbor). Footer ini dijaga: bila disembunyikan atau teksnya diubah, halaman terkunci.
- **Jangan** mengubah berkas selain `js/config.js`, dan jangan menghapus atau menutupi hak cipta. Halaman akan **terkunci**.
- Wajib HTTPS (GitHub Pages sudah HTTPS). Bila memakai Cloudflare, matikan *Auto Minify* dan *Rocket Loader* karena bisa memicu kunci yang keliru.
- Pencabutan lisensi berlaku paling lambat 24 jam kemudian.

## 11. Pasang di Blogger (domain blog sendiri)

Tema Blogger hanya "pintu masuk". File aplikasi (CSS, JS, gambar, `nk-license-blogger.js`) tetap di GitHub Pages, jadi langkah 3 (unggah ke GitHub) harus sudah selesai.

1. **GitHub dulu**: pastikan isi ZIP terbaru sudah di-*push*, termasuk `nk-license-blogger.js`. Buka `https://USERNAME.github.io/REPO/nk-license-blogger.js` di browser untuk memastikan berkasnya ada.
2. **Cadangkan tema lama**: Blogger → **Tema** → ▾ → **Cadangkan**.
3. Buka `tema-biolink.xml` dengan Notepad. Di bagian paling atas ada blok **PENGATURAN TEMA**, satu-satunya bagian yang boleh diubah:
   - `GAS_URL`: URL `/exec` Apps Script Anda (sudah terisi).
   - `NAMA_USAHA`: nama usaha untuk hak cipta saat berlisensi.
   - `ASET`: alamat GitHub Pages, diakhiri `/` (bawaan `https://nabirekreatif.github.io/biolink/`).
   - `VERSI`: **naikkan angkanya** (7 → 8 → 9 …) setiap kali Anda memperbarui file di GitHub, supaya pengunjung tidak memakai file lama dari cache.
4. Blogger → **Tema** → ▾ → **Edit HTML** → hapus semua → tempel isi `tema-biolink.xml` → **Simpan**. (Atau ▾ → **Pulihkan** → unggah berkas XML.)
5. **Judul & deskripsi** situs diatur di Blogger → **Setelan** (Judul, Deskripsi, Deskripsi penelusuran), bukan di kode.
6. **Halaman admin**: Blogger → **Halaman** → **Halaman baru** → judul `admin` → isi kosong → **Publikasikan**. Alamatnya menjadi `domainblog/p/admin.html` dan otomatis menampilkan dasbor.
7. Buka blog di **jendela Incognito**. Beranda menampilkan Link Bio; halaman `/p/...` dan postingan lain tetap menampilkan isi Blogger biasa.
8. **Lisensi**: domain blog tampil dalam mode **DEMO** sampai diaktifkan lewat `domainblog/#key` atau pita DEMO. Jangan mengedit file di GitHub selain `js/config.js`: segel tetap diperiksa, jadi file yang diubah membuat halaman terkunci.

Catatan Blogger:
- Tombol **Install (PWA)** bekerja di domain blog. Manifest dibuat otomatis untuk domain blog Anda dan ikonnya mengikuti logo di dasbor.
- *Service worker* (mode offline) tidak tersedia di Blogger karena Blogger tidak bisa menyimpan berkas `sw.js`. Aplikasi tetap bisa dipasang dan berjalan normal saat online.
- Setiap kali file di GitHub diperbarui: push ke GitHub → naikkan `VERSI` di tema → Simpan tema.

---

## Update dari versi sebelumnya

**Edisi Kuliner v9** (layar pembuka, perbaikan simpan produk, tautan "Lihat situs"):
1. **Backend BERUBAH**: tempel ulang `Kode.gs` → **Deploy → Kelola deployment → Edit → Versi baru → Deploy** (URL tetap sama). Ini memperbaiki pesan *"Kategori harus salah satu dari: HP Baru, HP Second, Aksesoris"* saat menyimpan produk. Sekarang kategori yang dipilih di dasbor selalu diterima, dan kategori baru otomatis masuk daftar kategori.
2. Timpa semua berkas frontend dengan isi ZIP baru (termasuk `nk-license.js` & `nk-license-blogger.js`), tetap pakai `js/config.js` lama → push.
3. Blogger: pasang `tema-biolink.xml` baru (VERSI 9) → Simpan.

**Edisi Kuliner v8** (dasbor ramah HP):
1. Backend tidak berubah.
2. Timpa semua berkas frontend dengan isi ZIP baru, termasuk `nk-license.js` dan `nk-license-blogger.js`. Tetap pakai `js/config.js` lama. Lalu `git add .` → `git commit -m "v8"` → `git push`.
3. Blogger: pasang `tema-biolink.xml` baru (atau cukup naikkan `VERSI` di tema lama menjadi `8`) lalu Simpan.

**Edisi Kuliner v7** (data terbaru langsung tampil, tombol Install, tombol X zoom gambar, tema Blogger):
1. Backend tidak berubah (tidak perlu deploy ulang).
2. Timpa semua berkas frontend dengan isi ZIP baru, termasuk `nk-license.js` dan `nk-license-blogger.js`. **Tetap pakai `js/config.js` lama** yang berisi URL. Bila ingin, tambahkan baris `CACHE_SEGAR_DETIK: 120` (lihat contoh di `config.js` baru). Lalu `git add .` → `git commit -m "v7"` → `git push`.
3. Bila memakai Blogger: pasang `tema-biolink.xml` (bagian 11).

**Dari Acc Cell v6 ke edisi Kuliner** (situs baru disarankan):
1. Buat proyek Apps Script & spreadsheet **baru**, tempel keempat berkas `.gs`, jalankan `setupAplikasi()`. Paket data kuliner terpasang otomatis.
2. Bila ingin memakai spreadsheet lama: tempel `Kode.gs`, `Notifikasi.gs`, `CRM.gs`, `Migrasi.gs` baru, jalankan `setupAplikasi()` lalu **`gantiKeDataKuliner()`**. Isi produk, outlet, sosmed, dan teks akan diganti data contoh kuliner, sedangkan akun admin tetap.
3. Deploy **Versi baru**, unggah isi ZIP ke GitHub (tetap pakai `js/config.js` lama yang berisi URL), lalu push.

**v5 → v6** (modul Menu, FAQ, tombol header maks 2 / navigasi maks 5, pop-up hanya tutup via X, mode aplikasi, lisensi SDK v6):
1. Di Apps Script, ganti isi **Kode.gs** saja, lalu **Deploy → Kelola deployment → Edit → Versi baru → Deploy**. Bagian FAQ muncul otomatis di daftar bagian.
2. Timpa semua berkas frontend dengan isi ZIP baru, termasuk `nk-license.js` (tetap pakai `js/config.js` lama yang berisi URL). Lalu `git add .` → `git commit -m "v6"` → `git push`, dan tekan **Ctrl+Shift+R**.
3. Buka **Tampilan & Teks → Header & Navigasi**, pilih ulang tombol header (bawaan: Install + CS) karena saklar CS/Install/Mode gelap lama diganti pilihan tombol. Simpan.

**v4 → v5** (performa, Layanan bisa ditambah, Migrasi rapi):
1. Di Apps Script, ganti isi **Kode.gs** saja (berkas lain tidak berubah), lalu **Deploy → Kelola deployment → Edit → Versi baru → Deploy**.
2. Timpa berkas frontend dengan isi ZIP baru (tetap pakai `js/config.js` lama yang berisi URL), lalu `git add .` → `git commit -m "v5"` → `git push`. Buka situs dan tekan **Ctrl+Shift+R**.

**v3 → v4**: ganti **Kode.gs**, **Notifikasi.gs**, **Migrasi.gs**, jalankan `setupAplikasi()` sekali (aman, hanya menambah kolom `kota`), lalu deploy **Versi baru**.

## Kecepatan & PageSpeed

- Pengunjung yang membuka ulang dalam **2 menit** langsung melihat tampilan terakhir. Lebih dari itu, halaman **menunggu data terbaru** (maks. 3 detik) sehingga hasil edit dasbor (gambar hero, pop-up, teks) langsung tampil, **tanpa tampilan lama atau data contoh muncul dulu**. Bila server lambat > 3 detik, tampilan terakhir dipakai sementara. Pop-up promo hanya dibuka dari data terbaru.
- Atur lewat `CACHE_SEGAR_DETIK` di `js/config.js` (atau di tema Blogger): `0` = selalu tunggu data terbaru.
- Pengunjung **pertama kali** melihat kerangka abu-abu netral sampai data dari Apps Script datang. Header/navigasi bawaan tidak lagi ditampilkan lalu dihilangkan, sehingga halaman tidak "melompat".
- Batas yang tersisa: kunjungan pertama tetap menunggu jawaban Apps Script (biasanya 1–3 detik, lebih lama bila server baru "bangun"). Ini sifat layanan gratis Google, bukan kode template.
- Nilai PageSpeed bervariasi tiap pengujian. Uji 2–3 kali dan lihat rata-ratanya.

## Pemecahan masalah

| Gejala | Penyebab & solusi |
|---|---|
| Situs 404 di GitHub Pages | `index.html` tidak berada di root repo. Ulangi `git init` dari folder yang berisi `index.html`. |
| "Data belum bisa dimuat" | `GAS_URL` salah, deploy belum *Versi baru*, atau akses deploy bukan "Siapa saja". |
| "Backend belum disiapkan" | Jalankan `setupAplikasi()`. |
| Login terkunci 15 menit | Lima kali salah sandi. Tunggu, atau superadmin melakukan reset. |
| Gambar gagal diunggah | Kebijakan Google Workspace melarang berbagi publik. Minta admin Workspace mengizinkan berbagi "Siapa saja yang memiliki link". |
| WA tidak terkirim | Cek token dan status perangkat Fonnte (harus `connect`), lihat tab **Antrean**, lalu jalankan `pasangTrigger()`. |
| Tampilan/data lama sempat muncul lalu berubah | Perbarui ke v7. Di Blogger: pasang `tema-biolink.xml` baru (tema lama memakai skrip awal versi lama) dan naikkan `VERSI`. |
| Simpan produk gagal: "Kategori harus salah satu dari: HP Baru…" | Backend masih versi lama. Tempel `Kode.gs` v9 lalu Deploy → Versi baru. |
| Tombol Install tidak muncul / tidak bereaksi | Perbarui ke v7. Chrome hanya menawarkan pemasangan bila manifest valid dan aplikasi belum terpasang; bila prompt tidak tersedia, tombol menampilkan petunjuk pemasangan manual. Coba di Chrome (bukan browser bawaan WhatsApp/Instagram). |
| Di Blogger tampil teks polos / terkunci | `nk-license-blogger.js` belum ada di GitHub, atau `ASET` di tema salah. Buka URL berkas itu di browser, lalu naikkan `VERSI`. |
| Warna/teks baru belum tampil | Tunggu ±1 menit atau muat ulang halaman. Pastikan backend sudah *Versi baru* v4. |
| Halaman terkunci "Template tidak berlisensi" | Ada berkas tersegel yang diubah, atau hosting mengubah berkas. Unggah ulang berkas asli. |

## Batasan yang perlu diketahui

- **Foto produk contoh** memakai gambar dari referensi desain Google Stitch yang di-hosting Google. Ganti dengan foto asli toko dari dasbor, karena tautan contoh tidak dijamin selamanya.
- Pengiriman WA bergantung pada status perangkat Fonnte. Balasan WA dari pelanggan tidak tercatat otomatis.
- Pencabutan lisensi berlaku paling lambat 24 jam kemudian. Proteksi di browser mempersulit pembajakan, tetapi tidak 100% anti-bobol.
