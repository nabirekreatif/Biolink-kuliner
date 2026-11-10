/* ==========================================================================
 *  Bio Link WebApp — inti: API (fetch REST ke GAS), cache perangkat (SWR),
 *  router hash SPA, toast/sheet, statistik, PWA, penyesuaian bilah lisensi.
 *  © Nabire Kreatif — template berlisensi
 * ========================================================================== */
(function () {
  'use strict';
  const CFG = window.ACC_CONFIG || {};
  const GAS_URL = String(CFG.GAS_URL || '').trim();
  const LS = 'acc:v1:';
  const App = window.App = { mode: window.ACC_MODE === 'admin' ? 'admin' : 'public', base: window.ACC_BASE != null ? String(window.ACC_BASE) : (window.ACC_MODE === 'admin' ? '../' : ''), cfg: CFG, gas: GAS_URL, demo: !GAS_URL, pub: null, admin: null, pages: {}, cur: '', dirty: {} };

  /* ---------------- util ---------------- */
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const I = (n, cls) => '<span class="mi' + (cls ? ' ' + cls : '') + '" aria-hidden="true">' + n + '</span>';
  const rp = n => 'Rp ' + String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const hp08 = v => { let s = String(v == null ? '' : v).replace(/[^0-9+]/g, '').replace(/^\+/, ''); if (s.indexOf('62') === 0) s = '0' + s.slice(2); else if (s[0] === '8') s = '0' + s; return s; };
  const hp62 = v => { const s = hp08(v); return s ? '62' + s.slice(1) : ''; };
  const hashStr = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h + ':' + s.length; };
  const debounce = (fn, ms) => { let t; return function () { const a = arguments; clearTimeout(t); t = setTimeout(() => fn.apply(this, a), ms); }; };
  const img = (u, w) => { u = String(u || ''); if (/lh3\.googleusercontent\.com\/d\/[^=]+$/.test(u)) return u + '=w' + (w || 800); if (u && App.base && !/^([a-z]+:|\/|data:|blob:|\.\.\/)/i.test(u)) return App.base + u; return u; };   // gambar relatif (assets/…) → folder aplikasi (juga saat dimuat dari Blogger)
  const cabNama = c => {
    if (c === 'keduanya') return App.T ? App.T('label_semua_cabang') : 'Semua cabang';
    if (c === 'semua') return 'Semua';
    const list = (App.mode === 'admin' ? (App.admin && App.admin.branches) : (App.pub && App.pub.branches)) || [];
    const b = list.find(x => String(x.id) === String(c));
    return b ? String(b.kota || String(b.nama || c).replace(/^Cabang\s+/i, '')) : String(c || '');
  };
  const tgl = iso => { if (!iso) return '-'; const d = new Date(iso); if (isNaN(d)) return String(iso); return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2);
  Object.assign(App, { $, $$, esc, I, rp, hp08, hp62, debounce, img, cabNama, tgl, uid, hashStr });

  /* ---------------- ikon sosial media (SVG garis, jelas tanpa font) ---------------- */
  const SVG = {
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    youtube: '<path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/>',
    tiktok: '<path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>',
    whatsapp: '<path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/>',
    website: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    shopee: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    telegram: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    x: '<path d="M4 4l16 16M20 4 4 20"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    tokopedia: '<path d="m2 7 4.4-4.4A2 2 0 0 1 7.8 2h8.4a2 2 0 0 1 1.4.6L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M2 7h20v3a2 2 0 0 1-2 2 3 3 0 0 1-2-1 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-4 0 3 3 0 0 1-2 1 2 2 0 0 1-2-2z"/>'
  };
  const socIcon = k => '<svg class="si" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (SVG[k] || SVG.website) + '</svg>';
  App.socIcon = socIcon;
  function sosmedList(s, gaya) {
    return s.map(x => {
      const k = String(x.platform || '').toLowerCase(), wa = x.url === '#wa' || (k === 'whatsapp' && !/^https?:/.test(x.url || ''));
      const at = (wa ? 'href="#" data-wa-any' : 'href="' + esc(x.url) + '" target="_blank" rel="noopener"') + ' data-soc="' + esc(k) + '"';
      return gaya === 'bulat'
        ? '<a class="soc-r" ' + at + ' aria-label="' + esc(x.platform) + '"><span class="b">' + socIcon(k) + '</span><span class="l">' + esc(x.platform) + '</span></a>'
        : '<a class="soc-btn" ' + at + '><span class="b">' + socIcon(k) + '</span><span class="grow"><b>' + esc(x.platform) + '</b>' + (x.label ? '<small>' + esc(x.label) + '</small>' : '') + '</span>' + I('arrow_forward') + '</a>';
    }).join('');
  }
  App.sosmedList = sosmedList;

  const ICON_SET = ['storefront', 'home', 'smartphone', 'build_circle', 'qr_code_scanner', 'account_balance_wallet', 'location_on', 'map', 'menu', 'apps', 'grid_view', 'category', 'shopping_bag', 'sell', 'redeem', 'local_shipping', 'restaurant', 'local_cafe', 'checkroom', 'spa', 'directions_car', 'two_wheeler', 'school', 'medical_services', 'construction', 'support_agent', 'chat', 'call', 'info', 'photo_camera', 'event', 'favorite', 'star', 'published_with_changes', 'headphones', 'new_releases', 'recycling', 'inventory_2', 'home_repair_service', 'hotel', 'pets', 'fitness_center', 'content_cut', 'local_laundry_service', 'print', 'computer', 'diamond', 'shopping_cart', 'phone_iphone', 'phone_android', 'tablet_mac', 'watch', 'cable', 'battery_charging_full', 'sim_card', 'wifi', 'local_offer', 'percent', 'loyalty', 'campaign', 'help', 'quiz', 'link', 'language', 'payments', 'credit_card', 'receipt_long', 'schedule', 'emoji_events', 'thumb_up', 'workspace_premium', 'bolt', 'rocket_launch', 'videocam', 'music_note', 'sports_esports', 'menu_book', 'brush', 'local_florist', 'bakery_dining', 'icecream', 'lunch_dining', 'directions_bike', 'flight', 'apartment', 'handyman', 'cleaning_services', 'child_care', 'face'];
  /* ---------------- TEKS & PENGATURAN TAMPILAN (semua bisa diubah dari dasbor) ---------------- */
  /* Tombol sistem (bisa dipasang di navigasi bawah / header) */
  const MENU_SYS = [{ id: 'bio', label: 'Beranda', icon: 'storefront', link: 'bio', sys: 1 }, { id: 'menu', label: 'Menu', icon: 'menu', link: 'aksi:menu', sys: 1 },
    { id: 'cs', label: 'CS', icon: 'chat', link: 'aksi:cs', sys: 1 }, { id: 'install', label: 'Install', icon: 'install_mobile', link: 'aksi:install', sys: 1 },
    { id: 'tema', label: 'Mode gelap', icon: 'dark_mode', link: 'aksi:tema', sys: 1 }, { id: 'share', label: 'Bagikan', icon: 'share', link: 'aksi:share', sys: 1 },
    { id: 'keranjang', label: 'Pesanan', icon: 'shopping_bag', link: 'keranjang', sys: 1 }];
  const HDR_DEF = [{ id: 'install', tampil: true }, { id: 'cs', tampil: true }, { id: 'tema', tampil: false }];
  const FAQ_DEF = [{ q: 'Apakah semua menu halal?', a: 'Ya. Semua bahan kami halal, segar setiap hari, dan dimasak saat dipesan tanpa pengawet.' },
    { q: 'Bisa pesan antar ke rumah?', a: 'Bisa. Masukkan menu ke keranjang, pilih "Diantar", lalu kirim pesanan lewat WhatsApp. Ongkir dihitung admin sesuai jarak.' },
    { q: 'Bagaimana cara memesan beberapa menu sekaligus?', a: 'Tekan tombol + pada setiap menu, atur jumlahnya di keranjang, lalu tekan "Kirim Pesanan via WhatsApp". Rincian & total otomatis terkirim.' },
    { q: 'Pembayaran bisa lewat apa saja?', a: 'Tunai, transfer bank, dan QRIS resmi. Lihat menu Rekening & QRIS — pastikan selalu atas nama usaha kami.' }];
  const NAV_DEF = [{ id: 'bio', label: 'Beranda', icon: 'home', tampil: true }, { id: 'katalog', label: 'Menu', icon: 'restaurant_menu', tampil: true },
    { id: 'keranjang', label: 'Pesanan', icon: 'shopping_bag', tampil: true }, { id: 'lokasi', label: 'Outlet', icon: 'storefront', tampil: true },
    { id: 'layanan', label: 'Layanan', icon: 'delivery_dining', tampil: false }, { id: 'bayar', label: 'Bayar', icon: 'account_balance_wallet', tampil: false },
    { id: 'menu', label: 'Lainnya', icon: 'menu', tampil: true }];
  const TXT_DEF = App.TXT_DEF = {
    header_tampil: 'YA', header_tampil_nama: 'YA', tombol_install: 'YA', tombol_install_teks: 'Install', tombol_cs: 'YA', tombol_cs_teks: 'CS',
    tombol_tema: 'YA', tema_bawaan: 'terang', faq_judul: 'Pertanyaan yang Sering Ditanyakan', faq_items: JSON.stringify(FAQ_DEF), menu_items: '', header_items: JSON.stringify(HDR_DEF), navbawah_tampil: 'YA', navatas_tampil: 'YA', nav_items: JSON.stringify(NAV_DEF),
    menu_katalog_tampil: 'YA', menu_katalog_judul: 'Menu Makanan & Minuman', menu_katalog_ikon: 'restaurant_menu',
    menu_bayar_tampil: 'YA', menu_bayar_judul: 'Rekening & QRIS Resmi', menu_bayar_ikon: 'account_balance_wallet', menu_bayar_chip: 'Resmi',
    menu_layanan_tampil: 'YA', menu_layanan_judul: 'Pesan Antar, Reservasi & Catering', menu_layanan_ikon: 'delivery_dining',
    menu_lokasi_tampil: 'YA', menu_lokasi_judul: 'Lokasi Outlet', menu_lokasi_sub: 'Alamat, jam buka & peta semua outlet', menu_lokasi_ikon: 'storefront',
    sosmed_judul: 'Ikuti Kami', cabang_judul: 'Outlet & Kontak WhatsApp', cabang_jumlah: '2', teks_chat: 'Chat', teks_maps: 'Google Maps', teks_lihat_semua: 'Lihat semua',
    lokasi_judul: 'Lokasi Outlet', lokasi_sub: 'Temukan outlet terdekat, jam buka & petunjuk arah', lokasi_cari: 'Cari kota, alamat, atau nama outlet…',
    kategori_list: 'Makanan, Minuman, Camilan, Paket Hemat', label_semua: 'Semua', label_semua_cabang: 'Semua outlet', kata_produk: 'menu', katalog_cari: 'Cari nasi goreng, kopi, jus…',
    label_merek: 'Jenis', label_ram: 'Porsi', label_memori: 'Level Pedas', label_warna: 'Varian', label_kondisi: 'Label', label_kelengkapan: 'Isi & Pelengkap', label_garansi: 'Waktu Saji',
    label_tersedia: 'Tersedia', label_habis: 'Habis', tombol_pesan: 'Pesan', tombol_habis: 'Habis Hari Ini', label_promo: 'Hemat', label_lokasi_filter: 'Outlet',
    teks_pesan_wa: 'Halo {toko} {cabang}, saya mau pesan *{produk}* {varian}harga {harga}. Masih tersedia?\n{link}',
    detail_spek_judul: 'Detail Menu', detail_kelengkapan_judul: 'Isi & Pelengkap', detail_jaminan1: 'Bahan segar & halal', detail_jaminan2: 'Dimasak saat dipesan', detail_tombol: 'Pesan via WhatsApp',
    katalog_trust_tampil: 'YA', katalog_trust_judul: 'Bahan Segar Setiap Hari', katalog_trust_sub: 'Dimasak saat dipesan, tanpa pengawet & halal',
    cta_tampil: 'YA', cta_judul: 'Pesan untuk Acara atau Kantor?', cta_teks: 'Kami melayani nasi kotak, tumpeng, prasmanan & catering harian. Chat admin untuk penawaran.',
    bayar_judul: 'Rekening & QRIS Resmi', bayar_sub: 'Bayar aman hanya ke rekening & QRIS resmi kami', bayar_peringatan_judul: 'Perhatian Keamanan',
    bayar_konfirmasi_judul: 'Konfirmasi Bukti Transfer', bayar_konfirmasi_teks: 'Setelah transfer berhasil, kirim tangkapan layar bukti pembayaran ke admin cabang untuk verifikasi.',
    layanan_tips: 'Untuk catering di atas 50 porsi, pesan minimal H-2 agar bahan disiapkan segar.',
    warna_aksen: '#E4572E', warna_aksen_teks: '#FFFFFF', warna_teks: '#1F1A17', warna_teks2: '#6B5E57', warna_latar: '#FFF8F0', warna_kartu: '#FFFFFF',
    warna_garis: '#F1E3D3', warna_harga: '#C2410C', warna_wa: '#25D366', warna_sosmed: '#1F1A17', warna_header: '#FFFFFF',
    keranjang_aktif: 'YA', kartu_badge: 'YA', tombol_tambah: 'Tambah', keranjang_judul: 'Pesanan Saya', keranjang_jenis: 'Makan di tempat, Bawa pulang, Diantar',
    keranjang_catatan: 'Ongkir pesan antar dihitung admin sesuai jarak. Pembayaran dikonfirmasi lewat WhatsApp.',
    teks_pesan_keranjang: 'Halo {toko} {cabang}, saya mau pesan:\n{daftar}\n\n*Total: {total}*\nJenis: {jenis}\nNama: {nama}{alamat}{catatan}\n\nTerima kasih!'
  };
  const SET = () => (App.mode === 'admin' ? (App.admin && App.admin.settings) : (App.pub && App.pub.settings)) || {};
  App.T = function (k) { const v = SET()[k]; return v === undefined || v === null || String(v).trim() === '' ? (TXT_DEF[k] !== undefined ? TXT_DEF[k] : '') : String(v); };
  App.on_ = k => String(App.T(k)).toUpperCase() === 'YA';
  App.kategori = () => String(App.T('kategori_list')).split(',').map(x => x.trim()).filter(Boolean);
  App.navItems = function () {
    let a; try { a = JSON.parse(App.T('nav_items')); } catch (e) { a = null; } if (!Array.isArray(a) || !a.length) a = NAV_DEF.map(x => Object.assign({}, x));
    const all = App.allMenus ? App.allMenus() : NAV_DEF; a = a.filter(x => x && all.some(m => m.id === x.id));
    const ids = a.map(x => x.id); all.forEach(m => { if (ids.indexOf(m.id) < 0) { const d = NAV_DEF.find(n => n.id === m.id); a.push({ id: m.id, label: d ? d.label : App.shortLabel(m), icon: d ? d.icon : m.icon, tampil: false }); } });
    let on = 0; return a.map(x => { const r = Object.assign({}, x); if (r.tampil && ++on > 5) r.tampil = false; return r; });
  };
  App.ICON_SET = ICON_SET;
  const J = (k, d) => { try { const a = JSON.parse(App.T(k)); return Array.isArray(a) ? a : d; } catch (e) { return d; } };
  /* Menu isi (tombol link bio & lembar Menu) — bawaan dari pengaturan lama + menu buatan sendiri */
  App.menuBase = () => ['katalog', 'bayar', 'layanan', 'lokasi'].map(k => ({ id: k, label: App.T('menu_' + k + '_judul'), sub: SET()['menu_' + k + '_sub'] || App.T('menu_' + k + '_sub'), icon: App.T('menu_' + k + '_ikon'), link: k, tampil: App.on_('menu_' + k + '_tampil') }));
  App.menuItems = function () {
    const base = App.menuBase(), a = J('menu_items', []).filter(x => x && x.id);
    if (!a.length) return base;
    const ids = a.map(x => x.id);
    base.forEach(b => { if (ids.indexOf(b.id) < 0) a.push(Object.assign({}, b, { tampil: false })); });
    return a.map(x => Object.assign({ icon: 'apps', label: x.id }, base.find(b => b.id === x.id) && !x.custom ? { link: x.id } : {}, x));
  };
  App.MENU_SYS = MENU_SYS;
  App.allMenus = () => App.menuItems().concat(MENU_SYS.map(x => Object.assign({}, x)));
  App.menuById = id => App.allMenus().find(x => x.id === id);
  const SHORT = {}; NAV_DEF.forEach(n => { if (n.id !== 'bio' && n.id !== 'menu') SHORT[n.id] = n.label; });
  App.shortLabel = m => { if (!m) return ''; if (m.custom) return m.label; const n = J('nav_items', []).find(x => x && x.id === m.id); return (n && n.label) || SHORT[m.id] || m.label; };
  /* tautan menu → href + atribut */
  App.menuLink = function (m) {
    let l = String((m && m.link) || '').trim();
    const pages = { bio: '#/', katalog: '#/katalog', bayar: '#/bayar', pembayaran: '#/bayar', layanan: '#/layanan', lokasi: '#/lokasi', keranjang: '#/keranjang' };
    if (pages[l]) return { href: pages[l], attr: ' data-nav="' + (l === 'pembayaran' ? 'bayar' : l) + '"' };
    if (/^aksi:/.test(l)) return { href: '#', attr: ' data-act="' + l.slice(5) + '"' + (l === 'aksi:menu' ? ' data-menu' : '') };
    if (/^kat:/.test(l)) return { href: '#/katalog/' + encodeURIComponent('k:' + l.slice(4)), attr: ' data-nav="katalog"' };
    if (/^cari:/.test(l)) return { href: '#/katalog/' + encodeURIComponent('q:' + l.slice(5)), attr: ' data-nav="katalog"' };
    if (/^#\//.test(l)) return { href: l, attr: '' };
    if (/^#./.test(l)) return { href: '#/katalog/' + encodeURIComponent('q:' + l.slice(1)), attr: ' data-nav="katalog"' };
    if (/^(https?:|mailto:|tel:)/i.test(l)) return { href: l, attr: ' target="_blank" rel="noopener"' };
    if (/^wa\.me|^[\w-]+(\.[\w-]+)+/i.test(l)) return { href: 'https://' + l, attr: ' target="_blank" rel="noopener"' };
    return { href: '#/', attr: '' };
  };
  App.headerItems = function () {
    const all = App.allMenus(), a = J('header_items', HDR_DEF).filter(x => x && all.some(m => m.id === x.id));
    const ids = a.map(x => x.id); all.forEach(m => { if (ids.indexOf(m.id) < 0) a.push({ id: m.id, tampil: false }); });
    let on = 0; return a.map(x => { const r = Object.assign({}, x); if (r.tampil && ++on > 2) r.tampil = false; return r; });
  };
  App.headerBtn = function (x) {
    const m = App.menuById(x.id); if (!m) return '';
    const lb = esc(x.label || (m.id === 'cs' ? App.T('tombol_cs_teks') : m.id === 'install' ? App.T('tombol_install_teks') : App.shortLabel(m)));
    if (m.id === 'tema') return '<button class="icon-btn btn-theme" data-theme-toggle type="button" aria-label="Mode gelap / terang">' + I(App.theme && App.theme() === 'gelap' ? 'light_mode' : 'dark_mode') + '</button>';
    if (m.id === 'install') return '<button class="btn-install" data-install type="button" hidden aria-label="Pasang aplikasi">' + I(x.icon || 'install_mobile') + '<span>' + lb + '</span></button>';
    if (m.id === 'cs') return '<button class="btn-cs" data-cs data-act="cs" type="button" aria-label="Chat customer service">' + I(x.icon || 'chat') + '<span>' + lb + '</span></button>';
    const L = App.menuLink(m);
    return '<a class="btn-hdr" href="' + esc(L.href) + '"' + L.attr + '>' + I(x.icon || m.icon) + '<span>' + lb + '</span></a>';
  };
  const NAV_HREF = { bio: '#/', katalog: '#/katalog', layanan: '#/layanan', bayar: '#/bayar', lokasi: '#/lokasi', keranjang: '#/keranjang', menu: '#' };

  /* warna tema → variabel CSS (terang) + mode gelap */
  const hex = v => /^#[0-9a-f]{6}$/i.test(String(v || '').trim()) ? String(v).trim() : '';
  function mix(h, p) { const n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; const m = c => Math.round(c + (255 - c) * p).toString(16).padStart(2, '0'); return '#' + m(r) + m(g) + m(b); }
  App.applyTheme = function () {
    const W = k => hex(App.T(k)) || TXT_DEF[k];
    const ak = W('warna_aksen');
    const css = ':root{--amber:' + ak + ';--on-amber:' + W('warna_aksen_teks') + ';--amber-soft:' + mix(ak, .86) + ';--amber-line:' + mix(ak, .55) + ';--amber-ink:' + W('warna_harga') +
      ';--ink:' + W('warna_teks') + ';--ink-2:' + W('warna_teks2') + ';--canvas:' + W('warna_latar') + ';--surface:' + W('warna_kartu') + ';--line:' + W('warna_garis') +
      ';--wa:' + W('warna_wa') + ';--sos:' + W('warna_sosmed') + ';--hdr:' + W('warna_header') + '}' +
      'html[data-theme=dark]{--amber:' + ak + ';--amber-soft:rgba(255,255,255,.07);--amber-line:' + ak + '66;--amber-ink:' + ak + ';--ink:#F2F2F7;--ink-2:#A1A1A6;--ink-3:#8E8E93;--canvas:#0E0E10;--surface:#1C1C1E;--line:#2C2C2E;--line-2:#3A3A3C;--sos:#2C2C2E;--hdr:#151517;--ok-soft:rgba(48,209,88,.16);--danger-soft:rgba(255,69,58,.16);--info-soft:rgba(10,132,255,.16)}';
    let st = document.getElementById('theme-vars'); if (!st) { st = document.createElement('style'); st.id = 'theme-vars'; document.head.appendChild(st); }
    if (st.textContent !== css) st.textContent = css;
    const m = $('meta[name=theme-color]'); if (m) m.setAttribute('content', document.documentElement.dataset.theme === 'dark' ? '#151517' : (document.documentElement.classList.contains('standalone') ? W('warna_header') : ak));
  };
  /* mode gelap: pilihan pengunjung disimpan di perangkat; bawaan dari dasbor */
  App.theme = function () {
    if (App.mode === 'admin') return 'terang';
    const t = Store.get('tema', '');
    if (t && App.on_('tombol_tema')) return t;
    const d = App.T('tema_bawaan');
    return d === 'gelap' ? 'gelap' : d === 'sistem' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang';
  };
  App.setTheme = function (t) {
    if (t) Store.set('tema', t);
    document.documentElement.dataset.theme = App.theme() === 'gelap' ? 'dark' : 'light';
    $$('[data-theme-toggle]').forEach(b => { b.innerHTML = I(App.theme() === 'gelap' ? 'light_mode' : 'dark_mode'); });
    $$('[data-act="tema"] .mi').forEach(b => { b.textContent = App.theme() === 'gelap' ? 'light_mode' : 'dark_mode'; });
    App.applyTheme();
  };
  /* header & navigasi dibangun dari pengaturan */
  App.applyChrome = function () {
    if (App.mode !== 'admin' && GAS_URL && !App.pub) return;       // tunggu data — jangan tampilkan header/navigasi bawaan
    const S = SET();
    const brandLogo = $('.brand img'), brandName = $('[data-brand]');
    const lg = S.header_logo_url || S.logo_url;
    if (brandLogo) brandLogo.src = lg ? img(lg, 120) : App.base + 'assets/logo.png';
    if (brandName) { brandName.textContent = App.T('header_nama') !== '' ? App.T('header_nama') : (S.nama_toko || CFG.NAMA_USAHA || 'Bio Link'); if (App.mode !== 'admin') brandName.hidden = !App.on_('header_tampil_nama'); }
    if (lg) { const fi = $('link[rel=icon]'); if (fi) fi.href = img(lg, 96); }
    if (App.mode === 'admin') return;
    const top = $('.topbar'); if (top) top.hidden = !App.on_('header_tampil');
    document.body.classList.toggle('no-header', !App.on_('header_tampil')); document.documentElement.classList.toggle('no-header', !App.on_('header_tampil'));
    const ta = $('.top-actions'); if (ta) { ta.innerHTML = App.headerItems().filter(x => x.tampil).map(App.headerBtn).join(''); App.installBtn(App._canInstall); }
    const items = App.navItems().filter(x => x.tampil);
    const link = (x, cls) => { const m = App.menuById(x.id) || x, L = App.menuLink(m), act = /data-act="tema"/.test(L.attr);
      return '<a href="' + esc(L.href) + '"' + L.attr + (L.attr.indexOf('data-nav') < 0 && !/data-act/.test(L.attr) ? ' data-nav="' + esc(x.id) + '"' : '') + (cls ? ' class="' + cls + '"' : '') + '>' + I(act ? (App.theme() === 'gelap' ? 'light_mode' : 'dark_mode') : (x.icon || m.icon || 'apps')) + '<span>' + esc(x.label || App.shortLabel(m)) + '</span></a>'; };
    const td = $('[data-topnav]'); if (td) { td.innerHTML = items.map(x => link(x)).join(''); td.hidden = !App.on_('navatas_tampil'); }
    const bn = $('#pubnav'); if (bn) {
      const bi = items.slice(0, 5);
      bn.querySelector('.bnav-in').style.gridTemplateColumns = 'repeat(' + Math.max(1, bi.length) + ', 1fr)';
      bn.querySelector('.bnav-in').innerHTML = bi.map(x => link(x)).join('');
      bn.dataset.off = (!App.on_('navbawah_tampil') || !bi.length) ? '1' : '0';
      document.body.classList.toggle('no-bnav', bn.dataset.off === '1'); document.documentElement.classList.toggle('no-bnav', bn.dataset.off === '1');
    }
    $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === (App.pages[App.cur] && App.pages[App.cur].nav || App.cur)));
  };

  /* ---------------- penyimpanan perangkat ---------------- */
  const Store = App.Store = {
    get(k, d) { try { const v = localStorage.getItem(LS + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) { try { Object.keys(localStorage).filter(x => x.indexOf(LS + 'a:') === 0).forEach(x => localStorage.removeItem(x)); localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e2) { } } },
    del(k) { try { localStorage.removeItem(LS + k); } catch (e) { } },
    ss(k, v) { try { if (v === undefined) return sessionStorage.getItem(LS + k); sessionStorage.setItem(LS + k, v); } catch (e) { return null; } }
  };

  /* ---------------- pengukur kinerja ---------------- */
  const Perf = window.Perf = { rows: [], add(a, t, s) { this.rows.push({ action: a, total: t, server: s == null ? null : s, net: s == null ? null : t - s }); if (this.rows.length > 200) this.rows.shift(); }, table() { console.table(this.rows.slice(-30)); } };

  /* ---------------- API REST (timeout, retry baca, reqId tulis) ---------------- */
  const READ = /^(adminBoot|stats|batch|me|logs|notif\.config|notif\.queue|wa\.audience|wa\.blastList|crm\.list|crm\.stats|crm\.detail|crm\.export)$/;
  async function apiOnce(action, data, timeout, reqId) {
    const ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(() => ctrl && ctrl.abort(), timeout), t0 = performance.now();
    try {
      const res = await fetch(GAS_URL, { method: 'POST', redirect: 'follow', cache: 'no-store', signal: ctrl ? ctrl.signal : undefined,
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, token: App.token || '', reqId, data: data || {} }) });
      const text = await res.text();
      try { const j = JSON.parse(text); Perf.add(action, Math.round(performance.now() - t0), j.ms); return j; }
      catch (e) { return { success: false, network: true, retryable: res.status >= 500 || res.status === 429, message: 'Server membalas HTTP ' + res.status + ' (bukan JSON). Pastikan deploy Web App aksesnya "Anyone" dan URL /exec benar.' }; }
    } catch (err) {
      return { success: false, network: true, retryable: true, message: err && err.name === 'AbortError' ? 'Server terlalu lama merespons.' : 'Koneksi terputus. Periksa internet Anda.' };
    } finally { clearTimeout(timer); }
  }
  const waitOnline = ms => new Promise(r => { if (navigator.onLine !== false) return r(); const t = setTimeout(done, ms); function done() { clearTimeout(t); removeEventListener('online', done); r(); } addEventListener('online', done); });
  App.api = async function (action, data, opt) {
    opt = opt || {};
    if (!GAS_URL) return { success: false, message: 'Mode demo: backend belum terhubung. Isi GAS_URL di js/config.js.' };
    const isRead = READ.test(action), reqId = isRead ? '' : (opt.reqId || uid()), tries = isRead ? 3 : 2;
    let res;
    for (let i = 0; i < tries; i++) {
      if (i) { await new Promise(r => setTimeout(r, 1200 * i)); if (navigator.onLine === false) await waitOnline(15000); }
      res = await apiOnce(action, data, isRead ? (i ? 40000 : 25000) : (opt.timeout || 90000), reqId);
      if (res.success || !res.retryable) break;
    }
    if (!res.success && res.data && res.data.code === 'AUTH' && App.onAuthExpired) App.onAuthExpired();
    return res;
  };
  App.getPublic = async function () {
    const ctrl = window.AbortController ? new AbortController() : null, timer = setTimeout(() => ctrl && ctrl.abort(), 25000);
    try {
      const r = await fetch(GAS_URL + (GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'action=public', { cache: 'no-store', redirect: 'follow', signal: ctrl ? ctrl.signal : undefined });
      return JSON.parse(await r.text());
    } catch (e) { return { success: false, message: 'Gagal memuat data.' }; } finally { clearTimeout(timer); }
  };
  App.warmUp = function () { if (GAS_URL) fetch(GAS_URL + (GAS_URL.indexOf('?') > -1 ? '&' : '?') + 'ping=' + Date.now(), { mode: 'no-cors', cache: 'no-store' }).catch(() => { }); };

  /* ---------------- layar pembuka (splash) + persiapan aplikasi ----------------
   * Splash menutup layar sampai data penting + gambar di layar pertama siap, lalu memudar.
   * Kunjungan ulang dengan cache masih segar (html.warm) tidak menampilkan splash sama sekali. */
  const SP = { t0: Date.now(), pct: 0, timers: [], hidden: false };
  const spEl = () => document.getElementById('splash');
  App.splash = {
    aktif: () => { const e = spEl(); return !!(e && !SP.hidden && !document.documentElement.classList.contains('warm')); },
    step(p, msg) {   // kemajuan nyata (0–100) dari tahapan pemuatan
      const e = spEl(); if (!e) return; SP.pct = Math.max(SP.pct, p);
      const bar = e.querySelector('.sp-bar i'); if (bar) bar.style.width = SP.pct + '%';
      if (msg) App.splash.msg(msg);
    },
    msg(t, warn) { const m = spEl() && spEl().querySelector('.sp-msg'); if (m) { m.textContent = t; m.classList.toggle('warn', !!warn); } },
    lambat() {       // status koneksi lambat — loading tetap dipertahankan, tidak tanpa batas
      SP.timers.forEach(clearTimeout); SP.timers = [];
      SP.timers.push(setTimeout(() => App.splash.aktif() && App.splash.msg('Koneksi lambat, masih memuat data…', 1), 6000));
      SP.timers.push(setTimeout(() => App.splash.aktif() && App.splash.msg('Masih menghubungi server, mohon tunggu…', 1), 14000));
    },
    gagal(msg, retry) {
      const e = spEl(); if (!e) return; SP.timers.forEach(clearTimeout);
      e.classList.add('err'); App.splash.msg(msg || 'Gagal memuat data.', 1);
      const b = e.querySelector('.sp-retry'); if (b) { b.hidden = false; b.onclick = () => { b.hidden = true; e.classList.remove('err'); SP.pct = 0; App.splash.step(8, 'Memuat data…'); App.splash.lambat(); retry && retry(); }; }
    },
    // tunggu gambar penting di layar pertama + font (maks. ms), lalu pudarkan splash
    async selesai(maks) {
      if (SP.hidden) return; SP.timers.forEach(clearTimeout);
      const e = spEl();
      if (e && !document.documentElement.classList.contains('warm')) {
        App.splash.step(80, 'Menyiapkan tampilan…');
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const vh = innerHeight || 800;
        const imgs = $$('#app img, .topbar img').filter(i => { const r = i.getBoundingClientRect(); return r.width && r.top < vh && r.bottom > 0 && i.src; }).slice(0, 10);
        const muat = i => i.complete ? (i.decode ? i.decode().catch(() => { }) : null) : new Promise(r => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); });
        const tugas = imgs.map(muat).concat([document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => { }) : null]).filter(Boolean);
        let n = 0; tugas.forEach(p => Promise.resolve(p).then(() => App.splash.step(80 + Math.round(18 * (++n) / tugas.length))));
        await Promise.race([Promise.all(tugas), new Promise(r => setTimeout(r, maks || 3500))]);
        App.splash.step(100);
      }
      App.splash.hide();
    },
    hide() {
      if (SP.hidden) return; SP.hidden = true; SP.timers.forEach(clearTimeout);
      const d = document.documentElement, e = spEl(); d.classList.add('siap');
      if (e) { e.classList.add('out'); setTimeout(() => e.remove(), 450); }
      App.emit('siap');
    }
  };

  /* ---------------- data publik: SWR (tampil seketika dari cache) ---------------- */
  const CACHE_SEGAR = (CFG.CACHE_SEGAR_DETIK != null && CFG.CACHE_SEGAR_DETIK !== '' ? Number(CFG.CACHE_SEGAR_DETIK) || 0 : 120) * 1000;   // 0 = selalu tunggu data terbaru
  const tunggu = (p, ms) => Promise.race([p, new Promise(ok => setTimeout(() => ok('lambat'), ms))]);
  App.loadPublic = async function (force) {
    if (!GAS_URL) {   // mode demo: data contoh dimuat sesuai kebutuhan (tidak membebani situs yang sudah terhubung)
      if (!window.ACC_DEMO) await new Promise(r => { const s = document.createElement('script'); s.src = App.base + 'js/demo-data.js'; s.onload = s.onerror = r; document.head.appendChild(s); });
      setPub(window.ACC_DEMO, true); App.pubFresh = true; if (App.mode !== 'admin') App.splash.selesai(); return;
    }
    const c = Store.get('pub', null);
    const fresh = (Number(CFG.FRESH_DETIK) || 60) * 1000, recent = c && Date.now() - c.t < CACHE_SEGAR;
    const early = window.__accPub; window.__accPub = null;          // permintaan yang sudah dimulai di <head>
    const splash = App.mode !== 'admin' && !App.pub && App.splash.aktif();
    // cache masih segar → tampil seketika (tanpa splash); selain itu splash menunggu data terbaru
    if (c && !App.pub && recent) setPub(c.data, true);
    if (!early && c && !force && Date.now() - c.t < fresh) { App.pubFresh = true; return; }
    if (splash) { App.splash.step(15, 'Memuat data…'); App.splash.lambat(); }
    let r = null;
    if (early) {
      // ada data tersimpan → tunggu maks. 10 dtk lalu pakai data tersimpan; tanpa data → maks. 25 dtk
      r = await tunggu(early, c && !App.pub ? 10000 : 25000);
      if (r === 'lambat') { if (c && !App.pub) { setPub(c.data, true); if (splash) App.splash.selesai(1500); A_toast('Koneksi lambat — menampilkan data tersimpan.'); early.then(x => x && x.success && terima(x, c)); return; } r = null; }
    }
    if (!r || !r.success) { if (splash) App.splash.step(30); r = await App.getPublic(); }
    if (r && r.success) { terima(r, c); if (splash) App.splash.selesai(); }
    else if (!App.pub && c) { setPub(c.data, true); if (splash) App.splash.selesai(1500); A_toast('Gagal terhubung — menampilkan data tersimpan.'); }  // server gagal → data terakhir
    else if (!App.pub) {
      App.pubError = r && r.message || 'Gagal memuat data';
      if (splash) App.splash.gagal('Gagal memuat data. Periksa koneksi internet Anda.', () => App.loadPublic(true));
      else App.rerender();
    }
  };
  const A_toast = m => setTimeout(() => App.toast && App.toast(m), 500);
  function terima(r, c) {
    const h = hashStr(JSON.stringify(r.data));
    Store.set('pub', { t: Date.now(), h, data: r.data });
    App.pubFresh = true;
    if (App.splash.aktif()) App.splash.step(70, 'Menyiapkan tampilan…');
    if (!c || c.h !== h || !App.pub) setPub(r.data, false); else document.dispatchEvent(new CustomEvent('acc:fresh'));
  }
  function setPub(d, fromCache) {
    const first = !App.pub, chrome0 = chromeKey();
    App.pub = d; App.pubError = '';
    const s = (d && d.settings) || {};
    const de = document.documentElement, wasBoot = de.classList.contains('boot');
    // tampilan pertama / header-navigasi berubah → ganti elemen halaman sekaligus agar tidak dihitung "lompatan" (CLS)
    if (App.mode !== 'admin' && (wasBoot || (!first && chromeKey() !== chrome0))) $$('#app > .page').forEach(p => p.remove());
    de.classList.remove('boot');
    App.setTheme(); App.applyChrome();
    if (App.mode !== 'admin' && GAS_URL && !fromCache) saveBoot();
    if (App.refreshCopy) App.refreshCopy();
    if (App.mode !== 'admin') setTimeout(() => App.updateManifest(), 0);
    if (s.meta_deskripsi) { const m = $('meta[name=description]'); if (m) m.setAttribute('content', s.meta_deskripsi); }
    App.rerender();
    if (!fromCache || !GAS_URL) App.emit('pub');
  }

  // halaman publik di tab lain ikut diperbarui saat admin menyimpan perubahan
  addEventListener('storage', e => {
    if (App.mode === 'admin' || e.key !== LS + 'pub') return;
    const c = Store.get('pub', null);
    if (c && c.data && c.t) { if (A_hash(c.data) !== A_hash(App.pub)) setPub(c.data, true); } else if (c) App.loadPublic(true);
  });
  const A_hash = d => hashStr(JSON.stringify(d || null));
  function chromeKey() { return App.pub ? [App.on_('header_tampil'), App.on_('navbawah_tampil'), App.T('nav_items')].join('|') : ''; }
  /* snapshot kecil untuk dipasang di <head> sebelum halaman tergambar (warna, tema, header/navigasi, gambar slide pertama) */
  function saveBoot() {
    try {
      const st = document.getElementById('theme-vars'), b0 = (App.pub.banners || [])[0];
      const ob = Store.get('boot', null) || {};
      Store.set('boot', { t: Date.now(), mj: ob.mj, ati: ob.ati, fav: ob.fav, css: st ? st.textContent : '', def: App.T('tema_bawaan'), tt: App.on_('tombol_tema') ? 1 : 0, nh: App.on_('header_tampil') ? 0 : 1, nb: App.on_('navbawah_tampil') ? 0 : 1,
        hero: b0 && (App.pub.sections || []).some(x => x.id === 'hero' && x.tampil !== false) ? img(b0.gambar_url, heroW()) : '', logo: App.pub.settings && App.pub.settings.logo_url ? img(App.pub.settings.logo_url, 300) : '', bg: getComputedStyle(document.body).backgroundColor, ac: App.T('warna_aksen') || '' });
    } catch (e) { }
  }
  const heroW = App.heroW = () => (window.innerWidth || 400) > 600 ? 960 : 720;
  /* ---------------- event kecil ---------------- */
  const ev = {};
  App.on = (n, f) => (ev[n] = ev[n] || []).push(f);
  App.emit = (n, x) => (ev[n] || []).forEach(f => { try { f(x); } catch (e) { console.error(e); } });

  /* ---------------- router hash (halaman tidak dibuang) ---------------- */
  App.page = function (name, def) { App.pages[name] = def; };
  App.go = function (path) { const h = '#/' + path; if (location.hash === h) route(); else location.hash = h; };
  App.back = function (fallback) { if (history.length > 1 && App._navCount > 1) history.back(); else App.go(fallback || ''); };
  App._navCount = 0;
  App.rerender = function () {
    Object.keys(App.pages).forEach(k => App.dirty[k] = true);
    const def = App.pages[App.cur]; if (def) { App.dirty[App.cur] = false; def.render(pageEl(App.cur), App.param, true); }
  };
  function pageEl(name) {
    let el = document.querySelector('.page[data-page="' + name + '"]');
    if (!el) { el = document.createElement('section'); el.className = 'page'; el.dataset.page = name; $('#app').appendChild(el); }
    return el;
  }
  function route() {
    let raw = location.hash.replace(/^#\/?/, '');
    if (/^key\/?$/i.test(raw)) return;                       // menu lisensi (#key) — biarkan halaman saat ini
    const parts = raw.split('/');
    let name, param;
    if (App.mode === 'admin') { name = 'admin'; param = parts.map(decodeURIComponent).filter(Boolean).join('/'); }   // contoh: tampilan/warna
    else { name = App.pages[parts[0]] && !App.pages[parts[0]].admin ? parts[0] : 'bio'; param = parts.slice(1).map(decodeURIComponent).join('/'); }
    const prev = App.cur, def = App.pages[name];
    App._navCount++;
    const el = pageEl(name);
    const changed = prev !== name || App.param !== param;
    App.prev = prev; App.cur = name; App.param = param;
    $$('.page').forEach(p => p.hidden = p !== el);
    document.body.classList.toggle('pub', !def.admin);
    document.body.classList.toggle('is-admin', !!def.admin);
    document.body.classList.remove('has-sticky');
    if (def.render) def.render(el, param, false, changed);
    App.dirty[name] = false;
    $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === (def.nav || name)));
    document.body.classList.toggle('no-bnav', !def.admin && !!(pn0() && pn0().dataset.off === '1'));   // dasbor punya navigasi bawah sendiri
    const pn = $('#pubnav'); if (pn) pn.hidden = !!def.admin;
    if (changed && !def.keepScroll) App.scrollY(0);
    if (def.title) document.title = def.title(param) + ' — ' + ((App.pub && App.pub.settings && App.pub.settings.nama_toko) || CFG.NAMA_USAHA || 'Bio Link');
    App.emit('route', name);
  }
  App.route = route;
  const pn0 = () => $('#pubnav');
  App.scrollY = y => { try { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, y); } };

  /* ---------------- toast / sheet / konfirmasi ---------------- */
  App.toast = function (msg, type) {
    const box = $('#toasts'), t = document.createElement('div');
    t.className = 'toast ' + (type || 'ok'); t.setAttribute('role', 'status');
    t.innerHTML = I(type === 'err' ? 'error' : type === 'info' ? 'info' : 'check_circle') + '<div>' + esc(msg) + '</div>';
    box.appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, type === 'err' ? 5000 : 2600);
  };
  /* Kunci gulir halaman di belakang pop-up/menu (iOS & Android). */
  let lockN = 0, lockY = 0;
  App.lockScroll = function () {
    if (lockN++ > 0) return;
    lockY = window.scrollY;
    const b = document.body.style;
    document.documentElement.classList.add('locked');
    b.position = 'fixed'; b.top = -lockY + 'px'; b.left = '0'; b.right = '0'; b.width = '100%';
  };
  App.unlockScroll = function () {
    if (lockN === 0 || --lockN > 0) return;
    const b = document.body.style;
    document.documentElement.classList.remove('locked');
    b.position = ''; b.top = ''; b.left = ''; b.right = ''; b.width = '';
    App.scrollY(lockY);
  };
  App.sheet = function (html, opt) {
    opt = opt || {};
    const o = document.createElement('div');
    o.className = 'overlay' + (opt.center ? ' center' : ''); o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    o.innerHTML = '<div class="sheet' + (opt.lg ? ' lg' : '') + '">' + (opt.center ? '' : '<div class="grab"></div>') +
      (opt.title ? '<div class="sheet-h"><h3>' + esc(opt.title) + '</h3><button class="icon-btn" data-x aria-label="Tutup">' + I('close') + '</button></div>' : '') + html + '</div>';
    // lembar tanpa judul (mis. zoom gambar) tetap WAJIB punya tombol X — klik di luar tidak menutup
    if (!opt.title && !opt.noX && !o.querySelector('[data-x].popup-x')) { const x = document.createElement('button'); x.type = 'button'; x.className = 'sheet-x'; x.setAttribute('data-x', ''); x.setAttribute('aria-label', 'Tutup'); x.innerHTML = I('close'); o.querySelector('.sheet').appendChild(x); }
    const close = () => { if (!o.isConnected) return; o.remove(); document.removeEventListener('keydown', onKey); if (!o._unlocked) { o._unlocked = 1; App.unlockScroll(); } if (opt.onClose) opt.onClose(); };
    const onKey = e => { if (e.key === 'Escape') close(); };
    // tutup HANYA lewat tombol (X / Batal) — klik di luar tidak menutup, agar isian tidak hilang tak sengaja
    o.addEventListener('click', e => { if (e.target.closest('[data-x]')) close(); else if (e.target === o) { const sh = o.querySelector('.sheet'); if (sh) { sh.classList.remove('nudge'); void sh.offsetWidth; sh.classList.add('nudge'); } } });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(o);
    App.lockScroll();
    // elemen dihapus langsung (o.remove()) tetap membuka kunci gulir
    new MutationObserver((m, obs) => { if (!o.isConnected) { obs.disconnect(); if (!o._unlocked) { o._unlocked = 1; App.unlockScroll(); } } }).observe(document.body, { childList: true });
    o.close = close;
    const s = o.querySelector('.sheet'); if (s) s.scrollTop = 0;
    return o;
  };
  App.confirm = function (msg, okText, danger) {
    return new Promise(res => {
      const o = App.sheet('<p style="margin:0 0 16px;font-size:15px;line-height:22px">' + esc(msg) + '</p><div class="row"><button class="btn btn-ghost grow" data-x>Batal</button><button class="btn ' + (danger ? 'btn-danger' : 'btn-ink') + ' grow" data-ok>' + esc(okText || 'Ya, lanjutkan') + '</button></div>', { center: true, title: 'Konfirmasi', onClose: () => res(false) });
      o.querySelector('[data-ok]').onclick = () => { o.querySelector('[data-ok]').disabled = true; res(true); o.remove(); };
    });
  };
  App.copy = function (text, label) {
    const done = () => App.toast((label || 'Teks') + ' disalin');
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { const t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { App.toast('Gagal menyalin', 'err'); } t.remove(); }
  };

  /* ---------------- WhatsApp ---------------- */
  App.branches = () => ((App.pub && App.pub.branches) || []).filter(b => b.aktif !== false);
  App.branch = id => App.branches().find(b => b.id === id);
  App.waUrl = (nomor, msg) => 'https://wa.me/' + hp62(nomor) + (msg ? '?text=' + encodeURIComponent(msg) : '');
  App.openWa = function (cabang, msg, track) {
    const b = App.branch(cabang); if (!b) return App.toast('Nomor admin cabang belum diatur', 'err');
    if (track !== false) App.track('klik_wa', track && track.p, cabang);
    const text = typeof msg === 'function' ? msg(b) : msg;
    window.open(App.waUrl(b.nomor_wa, text), '_blank', 'noopener');
  };
  /** Pilih cabang (bottom sheet) lalu buka WhatsApp. msg(b) → teks */
  App.pickBranch = function (msg, opt) {
    opt = opt || {};
    const list = App.branches();
    if (list.length === 1) return App.openWa(list[0].id, msg, opt.track);
    const o = App.sheet('<p class="muted" style="margin:-4px 0 12px">' + esc(opt.sub || 'Pilih cabang ' + (SET().nama_toko || '') + ' yang ingin Anda hubungi:') + '</p><div class="list">' +
      list.map(b => '<button class="li" data-b="' + esc(b.id) + '" style="text-align:left;width:100%"><span class="avatar-i" style="background:#E7F9EE;color:#1DA851">' + I('chat', 'fill') + '</span><span class="grow"><b>' + esc(b.nama) + '</b><span class="meta">' + esc(hp08(b.nomor_wa)) + ' · ' + esc(b.jam_buka || '') + '</span></span>' + I('chevron_right') + '</button>').join('') + '</div>',
      { title: opt.title || 'Chat Admin WhatsApp' });
    o.addEventListener('click', e => { const t = e.target.closest('[data-b]'); if (t) { o.close(); App.openWa(t.dataset.b, msg, opt.track); } });
  };

  /* ---------------- statistik (batch, tanpa menunggu) ---------------- */
  let q = [], qt = null;
  App.track = function (j, p, c) {
    if (!GAS_URL || App.mode === 'admin') return;
    q.push({ j, p: p || '', c: c || '' });
    clearTimeout(qt); qt = setTimeout(flushTrack, q.length >= 10 ? 0 : 4000);
  };
  function flushTrack() {
    if (!q.length || !GAS_URL) return;
    const body = JSON.stringify({ action: 'track', data: { events: q.splice(0, 25) } });
    try { if (navigator.sendBeacon && navigator.sendBeacon(GAS_URL, new Blob([body], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) { }
    fetch(GAS_URL, { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' } }).catch(() => { });
  }
  addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushTrack(); });
  addEventListener('pagehide', flushTrack);

  /* ===== Ikon aplikasi (PWA) mengikuti logo di dasbor; bawaan = ikon Nabire Kreatif ===== */
  const ICON_KEY = 'pwaicon', Wc = k => { const v = String(App.T(k) || '').trim(); return /^#[0-9a-f]{3,8}$/i.test(v) ? v : TXT_DEF[k]; };
  function loadImg(src) { return new Promise((ok, no) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => ok(im); im.onerror = no; im.src = src; setTimeout(no, 12000); }); }
  function iconsFrom(im, bg) {
    const draw = (n, pad) => { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d');
      x.fillStyle = bg; x.fillRect(0, 0, n, n);
      const box = n * (1 - pad * 2), sc = Math.min(box / im.naturalWidth, box / im.naturalHeight), w = im.naturalWidth * sc, h = im.naturalHeight * sc;
      x.drawImage(im, (n - w) / 2, (n - h) / 2, w, h); return c.toDataURL('image/png'); };
    return { i192: draw(192, .06), i512: draw(512, .06), mask: draw(512, .18), apple: draw(180, .08), fav: draw(64, .02) };
  }
  App.updateManifest = async function () {
    if (App.mode === 'admin' || !App.pub) return;
    const S = SET(), logo = String(S.logo_url || '').trim(), nama = S.nama_toko || CFG.NAMA_USAHA || 'Bio Link', bg = Wc('warna_kartu') || '#FFFFFF';
    // start_url/scope/id WAJIB satu domain dengan halaman (GitHub Pages maupun Blogger); ikon boleh dari domain aset (GitHub)
    const appRoot = location.origin + location.pathname.replace(/[^/]*$/, ''), aset = new URL(App.base || './', location.href).href.split('#')[0].split('?')[0];
    const sig = [logo, bg].join('|');
    let ic = Store.get(ICON_KEY, null);
    if (!logo) ic = { sig, i192: aset + 'assets/icon-192.png', i512: aset + 'assets/icon-512.png', mask: aset + 'assets/icon-maskable-512.png', apple: aset + 'assets/apple-touch-icon.png', fav: aset + 'assets/favicon.png' };
    else if (!ic || ic.sig !== sig) {
      const src = new URL(img(logo, 512), location.href).href, lh = /^https:\/\/lh3\.googleusercontent\.com\/d\/[^=?#]+/.exec(src);
      if (lh) { const sq = n => lh[0] + '=s' + n + '-c'; ic = { sig, i192: sq(192), i512: sq(512), mask: sq(512), apple: sq(180), fav: sq(64), url: 1 }; }   // logo dari Drive: URL persegi asli (bisa diunduh Chrome/WebAPK)
      else {
        try { ic = Object.assign({ sig }, iconsFrom(await loadImg(src), bg)); }
        catch (e) { ic = { sig, i192: src, i512: src, mask: src, apple: src, fav: src, url: 1 }; }
      }
      try { Store.set(ICON_KEY, ic); } catch (e) { }
    }
    const man = { name: nama, short_name: nama.length > 12 ? nama.slice(0, 12).trim() : nama, description: S.meta_deskripsi || S.tagline || '', id: appRoot, start_url: appRoot + '#/', scope: appRoot,
      display: 'standalone', display_override: ['standalone', 'minimal-ui'], orientation: 'portrait', lang: 'id',
      background_color: Wc('warna_latar'), theme_color: Wc('warna_header'),
      icons: [{ src: ic.i192, sizes: '192x192', type: 'image/png', purpose: 'any' }, { src: ic.i512, sizes: '512x512', type: 'image/png', purpose: 'any' }, { src: ic.mask, sizes: '512x512', type: 'image/png', purpose: 'maskable' }],
      shortcuts: [{ name: App.T('menu_katalog_judul'), url: appRoot + '#/katalog', icons: [{ src: ic.i192, sizes: '192x192' }] }] };
    if (ic.url) man.icons.forEach(x => { delete x.type; });
    const mj = JSON.stringify(man);
    if (mj === App._manJson) return; App._manJson = mj;
    const bm = (Store.get('boot', null) || {}).mj, cur = $('link[rel="manifest"]');
    if (bm === mj && cur && /^blob:/.test(cur.getAttribute('href') || '')) { App._manifest = man; return; }   // sudah dipasang dari <head>
    const href = URL.createObjectURL(new Blob([mj], { type: 'application/manifest+json' }));
    const set = (rel, h) => { let l = $('link[rel="' + rel + '"]'); if (!l) { l = document.createElement('link'); l.rel = rel; document.head.appendChild(l); } if (l.getAttribute('href') !== h) l.setAttribute('href', h); };
    set('manifest', href); set('apple-touch-icon', ic.apple); set('icon', ic.fav);
    const am = $('meta[name="apple-mobile-web-app-title"]'); if (am) am.setAttribute('content', man.short_name);
    App._manifest = man;
    try { const b = Store.get('boot', null); if (b && b.mj !== mj) { b.mj = mj; b.ati = ic.apple; b.fav = ic.fav; delete b.man; Store.set('boot', b); } } catch (e) { }
  };

  /* ---------------- PWA: tombol "Install" di header (hilang otomatis bila sudah terpasang) ---------------- */
  let deferred = null;
  const PWA_KEY = 'pwa:terpasang';
  const isStandalone = () => (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  App.isStandalone = isStandalone;
  function installBtn(show) { App._canInstall = !!show; $$('[data-install]').forEach(b => { b.hidden = !show || b.dataset.allowed === '0' || isStandalone() || App.mode === 'admin'; }); }
  App.canInstall = () => !!App._canInstall && !isStandalone() && App.mode !== 'admin';
  App.installBtn = installBtn;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; Store.del(PWA_KEY); installBtn(true); });
  if (window.__bip) { deferred = window.__bip; window.__bip = null; Store.del(PWA_KEY); setTimeout(() => installBtn(true), 0); }   // event sempat muncul sebelum skrip ini dimuat
  addEventListener('appinstalled', () => { deferred = null; Store.set(PWA_KEY, Date.now()); installBtn(false); App.toast('Aplikasi ' + (SET().nama_toko || CFG.NAMA_USAHA || 'Bio Link') + ' terpasang di HP Anda'); });
  App.install = async function () {
    if (deferred) {
      const d = deferred; deferred = null; d.prompt();
      try { const r = await d.userChoice; if (r && r.outcome === 'accepted') { Store.set(PWA_KEY, Date.now()); installBtn(false); } else { deferred = d; } } catch (er) { }
      return;
    }
    App.sheet('<div class="center"><img src="' + esc((App._manifest && App._manifest.icons[0].src) || (App.base + 'assets/icon-192.png')) + '" alt="" style="width:72px;height:72px;border-radius:18px;margin:0 auto 12px"><p style="margin:0 0 14px;line-height:21px">' +
      (isIOS() ? 'Di Safari: ketuk tombol <b>Bagikan</b> ' + I('ios_share') + ' lalu pilih <b>“Tambah ke Layar Utama”</b>.' : 'Buka menu browser <b>⋮</b> lalu pilih <b>“Instal aplikasi”</b> atau <b>“Tambahkan ke layar utama”</b>.') +
      '</p><button class="btn btn-ink btn-block" data-x>Mengerti</button></div>', { center: true, title: 'Pasang Aplikasi ' + (SET().nama_toko || CFG.NAMA_USAHA || 'Bio Link') });
  };
  /* Mode aplikasi terpasang: matikan zoom agar tampilan rapi seperti aplikasi asli */
  function noZoom() {
    if (!isStandalone()) return;
    const d = document.documentElement; if (d.classList.contains('standalone')) return;
    d.classList.add('standalone'); if (isIOS()) d.classList.add('ios');
    const m = $('meta[name=viewport]'); if (m) m.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    const opt = { passive: false };
    ['gesturestart', 'gesturechange', 'gestureend'].forEach(n => document.addEventListener(n, e => e.preventDefault(), opt));   // cubit (iOS)
    document.addEventListener('touchmove', e => { if ((e.touches && e.touches.length > 1) || (e.scale && e.scale !== 1)) e.preventDefault(); }, opt);
    let last = 0; document.addEventListener('touchend', e => { const t = Date.now(); if (t - last < 320 && !e.target.closest('input,textarea,select,[contenteditable]')) e.preventDefault(); last = t; }, opt);  // ketuk ganda
    addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, opt);                                            // Ctrl + gulir (desktop)
    addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].indexOf(e.key) > -1) e.preventDefault(); });
    document.addEventListener('contextmenu', e => { if (e.target.closest('img,a') && !e.target.closest('input,textarea')) e.preventDefault(); });
  }
  if ('serviceWorker' in navigator && location.protocol === 'https:' && window.ACC_MODE !== 'admin' && window.ACC_BASE == null) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));

  /* ---------------- bilah lisensi: geser elemen bawah agar tidak tertutup ---------------- */
  function measureNk() {
    const host = document.querySelector('[data-nkl="1"]');
    if (!host || document.hidden) return;
    let h = 0;
    [16, 60, Math.round(innerWidth / 2)].forEach(x => {
      for (let y = innerHeight - 2; y > innerHeight - 160; y -= 4) {
        const el = document.elementFromPoint(Math.min(x, innerWidth - 1), y);
        if (el !== host) { h = Math.max(h, innerHeight - y - 4); break; }
      }
    });
    const v = (h > 0 ? h + 4 : 0) + 'px';
    if (document.documentElement.style.getPropertyValue('--nk-h') !== v) document.documentElement.style.setProperty('--nk-h', v);
  }
  App.measureNk = measureNk;
  App.nkCopy = function () {
    const st = window.NKLicense && NKLicense.status ? NKLicense.status() : { mode: 'demo' };
    const y = new Date().getFullYear(), situs = String((window.NKL && NKL.situs) || 'https://www.nabirekreatif.com').replace(/\/+$/, '');
    const nama = (App.pub && App.pub.settings && App.pub.settings.nama_toko) || (App.admin && App.admin.settings && App.admin.settings.nama_toko) || CFG.NAMA_USAHA || 'Bio Link';
    if (st.mode === 'lisensi' || st.mode === 'owner' || st.mode === 'dev')
      return '© ' + y + ' ' + esc(nama) + '. by <a href="' + esc(situs) + '" target="_blank" rel="noopener">Nabirekreatif.com</a>';
    return '© ' + y + ' Nabire Kreatif. Semua hak dilindungi. · <a href="' + esc(situs) + '" target="_blank" rel="noopener">www.nabirekreatif.com</a>';
  };
  function refreshCopy() { $$('[data-nk-copy]').forEach(el => el.innerHTML = App.nkCopy()); }
  App.refreshCopy = refreshCopy;

  /* ---------------- mulai ---------------- */
  App.start = function () {
    const c0 = Store.get('pub', null);
    if (App.mode !== 'admin' && GAS_URL && c0 && c0.data && !App.pub && Date.now() - c0.t < CACHE_SEGAR) { App.pub = c0.data; document.documentElement.classList.remove('boot'); App.splash.hide(); }
    App.setTheme(); App.applyChrome();
    document.addEventListener('click', e => { if (e.target.closest('[data-theme-toggle]')) { App.setTheme(App.theme() === 'gelap' ? 'terang' : 'gelap'); } });
    if (window.matchMedia) { const mq = matchMedia('(prefers-color-scheme: dark)'); if (mq.addEventListener) mq.addEventListener('change', () => App.setTheme()); }
    window.addEventListener('hashchange', route);
    route();
    App.loadPublic();
    if (App.mode === 'admin') App.warmUp();                       // publik: data sudah diminta sejak <head>, tidak perlu ping tambahan
    if (App.mode !== 'admin') App.track('kunjungan');
    if (Store.ss('visit') !== '1') { Store.ss('visit', '1'); }
    noZoom();
    installBtn(!!deferred || (isIOS() && !isStandalone()));           // iOS tidak punya prompt otomatis: tampilkan tombol berisi petunjuk
    if (window.matchMedia) { const mq = matchMedia('(display-mode: standalone)'); if (mq.addEventListener) mq.addEventListener('change', () => { installBtn(false); noZoom(); }); }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') { const away = Date.now() - (App._hiddenAt || Date.now()); if (away > 120000) { App.warmUp(); App.loadPublic(); } }
      else App._hiddenAt = Date.now();
    });
    if (window.NKLicense && NKLicense.ready) NKLicense.ready.then(() => { refreshCopy(); setTimeout(measureNk, 300); });
    addEventListener('nkl:status', () => { refreshCopy(); setTimeout(measureNk, 100); });
    refreshCopy();
    setTimeout(measureNk, 900); addEventListener('resize', debounce(measureNk, 300));
  };
})();
