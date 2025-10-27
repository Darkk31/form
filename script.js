// File: script.js (V13.0 - Pixel Mode & Readable)

// GANTI DENGAN LINK GOOGLE SHEET CSV KAMU
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVm7A6LvL2chRGyir6vqY-4hcgGLCHIeL7WdWb5NkET9aihdc3py86gJfv2GGhPJ8OeyWmVRBUivf2/pub?output=csv';

let databaseProduk = {};
let daftarNamaProduk = [];

// Nama key di localStorage
const KEY_RIWAYAT = 'app_data_h'; // h = history
const KEY_PENGATURAN = 'app_data_s'; // s = settings
const KEY_TEMA = 'app_data_t'; // t = theme

document.addEventListener('DOMContentLoaded', () => {

    // Ambil semua elemen penting dari HTML
    const formPengajuan = document.getElementById('form-pengajuan');
    const formatTypeSelect = document.getElementById('tipe-format');
    const itemList = document.getElementById('item-list');
    const tambahBarangBtn = document.getElementById('tambah-barang-btn');
    const hasilTeks = document.getElementById('hasil-teks');
    const hasilOutputSection = document.getElementById('hasil-output');
    const tombolCopy = document.getElementById('tombol-copy');
    const tanggalInput = document.getElementById('tanggal');
    const generateBtn = document.getElementById('generate-btn');
    const marketingInput = document.getElementById('marketing');
    
    // Elemen Tema BARU
    const tombolTema = document.getElementById('tombol-tema');
    
    // Elemen Modal
    const modalOverlay = document.getElementById('modal-overlay');
    const modalPengaturan = document.getElementById('modal-pengaturan');
    const tombolPengaturan = document.getElementById('tombol-pengaturan');
    const simpanPengaturanBtn = document.getElementById('simpan-pengaturan-btn');
    const namaSalesInput = document.getElementById('nama-sales-default');
    const modalRiwayat = document.getElementById('modal-riwayat');
    const tombolRiwayat = document.getElementById('tombol-riwayat');
    const riwayatList = document.getElementById('riwayat-list');
    const hapusRiwayatBtn = document.getElementById('hapus-riwayat-btn');
    const semuaTombolTutup = document.querySelectorAll('.tombol-tutup-modal');
    const tombolWA = document.getElementById('tombol-whatsapp');
    const nomorWaInput = document.getElementById('nomor-wa-direktur');
    const riwayatSearchInput = document.getElementById('riwayat-search-input');

    // --- (MODIFIKASI) Template HTML untuk Item ---
    function getItemHTML(nomorBarang) {
        // Template baru yang sesuai dengan style .card
        return `
            <div class="card__header">
                <h4>Barang ${nomorBarang}</h4>
                <button type="button" class="btn-delete-item hapus-barang-btn" title="Hapus barang ini">&times;</button>
            </div>
            <div class="card__content">
                <div class="input-grup">
                    <label>Nama Barang:</label>
                    <div class="search-container">
                        <input type="text" class="nama-barang-search" placeholder="Ketik & Pilih Produk...">
                        <div class="search-results hidden"></div>
                    </div>
                </div>
                
                <div class="grup-hg">
                    <label>Harga Grosir (HG):</label>
                    <input type="text" class="harga-grosir" placeholder="Otomatis">
                </div>
                
                <div class="input-grup">
                    <label>Harga Khusus (HK):</label>
                    <input type="text" class="harga-khusus" placeholder="Isi HK" required>
                </div>

                <div class="input-grup">
                    <label>Pengambilan (Qty):</label>
                    <input type="text" class="kuantitas" placeholder="Contoh: 5 dus" required>
                </div>
            </div>
        `;
    }

    // --- Fungsi Logika Inti ---
    async function loadDatabase() {
        console.log('Mulai mengambil data dari Google Sheet...');
        generateBtn.textContent = 'MEMUAT...';
        generateBtn.disabled = true;
        try {
            const response = await fetch(googleSheetURL);
            if (!response.ok) throw new Error('Gagal mengambil data.');
            const csvData = await response.text();
            databaseProduk = {};
            const baris = csvData.split('\n');
            // ... (Logika parsing CSV Anda, tidak berubah) ...
            for (let i = 1; i < baris.length; i++) {
                const barisData = baris[i].trim();
                if (barisData) {
                    let nama = "", hg = "", hk = "";
                    const pemisah1 = barisData.lastIndexOf(',');
                    const col_Last = barisData.substring(pemisah1 + 1).trim().replace(/"/g, '');
                    const sisa1 = barisData.substring(0, pemisah1).trim();
                    if (sisa1 === "") { nama = col_Last; hg = "0"; hk = "0"; }
                    else {
                        const pemisah2 = sisa1.lastIndexOf(',');
                        const col_Mid = sisa1.substring(pemisah2 + 1).trim().replace(/"/g, '');
                        const sisa2 = sisa1.substring(0, pemisah2).trim();
                        if (sisa2 === "") {
                            if (col_Last === "" && col_Mid.length > 0) { nama = col_Mid; hg = "0"; }
                            else { nama = col_Mid; hg = col_Last; }
                            hk = "0";
                        } else { nama = sisa2.replace(/"/g, ''); hg = col_Mid; hk = col_Last; }
                    }
                    if (nama.toLowerCase() === 'namaproduk') continue;
                    if (nama) { databaseProduk[nama] = { hg: hg || "0", hk: hk || "0" }; }
                }
            }
            
            daftarNamaProduk = Object.keys(databaseProduk).sort();
            console.log('Database berhasil dimuat:', databaseProduk);
            generateBtn.textContent = '🚀 BUAT TEKS';
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Error saat memuat database:', error);
            alert('GAGAL MEMUAT DATABASE PRODUK. Cek koneksi internet.');
            generateBtn.textContent = 'GAGAL';
        }
    }
    
    function getTanggalHariIni() {
        const today = new Date();
        const options = { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric' };
        const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(today);
        let day = '', month = '', year = '';
        for (const part of parts) { if (part.type === 'day') day = part.value; if (part.type === 'month') month = part.value; if (part.type === 'year') year = part.value; }
        return `${day}/${month}/${year}`;
    }
    
    // --- (MODIFIKASI) Fungsi renumberBlocks ---
    function renumberBlocks() {
        const semuaItem = itemList.querySelectorAll('.card--item'); // Cari .card--item
        semuaItem.forEach((item, index) => {
            item.querySelector('h4').textContent = `Barang ${index + 1}`;
        });
    }
    
    // --- (MODIFIKASI) Fungsi hapusBlokBarang ---
    function hapusBlokBarang(e) {
        if (e.target.classList.contains('hapus-barang-btn')) {
            const semuaItem = itemList.querySelectorAll('.card--item'); // Cari .card--item
            if (semuaItem.length <= 1) { 
                alert('Tidak bisa menghapus blok barang terakhir!'); 
                return; 
            }
            e.target.closest('.card--item').remove(); // Hapus .card--item
            renumberBlocks();
        }
    }
    
    // --- (MODIFIKASI) Fungsi tambahBarang ---
    function tambahBarang() {
        const itemBlock = document.createElement('div');
        itemBlock.className = 'card card--item'; // Class baru
        itemBlock.dataset.mode = 'standard';
        
        const nomorBarang = itemList.querySelectorAll('.card--item').length + 1; // Cari .card--item
        itemBlock.innerHTML = getItemHTML(nomorBarang); // Gunakan template baru
        
        itemList.appendChild(itemBlock);
    }
    
    // --- (Fungsi tidak berubah) ---
    function tampilkanHasilPencarian(searchTerm, resultsContainer) {
        resultsContainer.innerHTML = ''; resultsContainer.classList.remove('hidden');
        const filter = searchTerm.toLowerCase(); let hasMatches = false;
        for (const namaProduk of daftarNamaProduk) {
            if (namaProduk.toLowerCase().includes(filter)) {
                const item = document.createElement('div'); item.className = 'result-item'; item.textContent = namaProduk; item.dataset.value = namaProduk; resultsContainer.appendChild(item); hasMatches = true;
            }
        }
        const customItem = document.createElement('div'); customItem.className = 'result-item'; customItem.textContent = '-- Produk Custom (Isi Manual) --'; customItem.dataset.value = '__custom'; resultsContainer.appendChild(customItem);
    }
    
    // --- (MODIFIKASI) Fungsi updateTampilanBarang ---
    function updateTampilanBarang(itemBlock, selectedValue) {
        // itemBlock di sini sudah .card--item, tapi logikanya sama
        const searchInput = itemBlock.querySelector('.nama-barang-search'); 
        const hgInput = itemBlock.querySelector('.harga-grosir'); 
        const hkInput = itemBlock.querySelector('.harga-khusus');
        
        if (selectedValue === "__custom") { 
            itemBlock.dataset.mode = 'custom'; 
            searchInput.value = ''; 
            searchInput.placeholder = 'Ketik Nama Produk Custom...'; 
            hgInput.value = ""; 
            hgInput.placeholder = "Isi HG Manual"; 
            hkInput.value = ""; 
            hkInput.placeholder = "Isi HK (Boleh teks & simbol)"; 
        } else { 
            itemBlock.dataset.mode = 'standard'; 
            searchInput.value = selectedValue; 
            hgInput.placeholder = "Otomatis"; 
            hkInput.placeholder = "Otomatis"; 
            const produkData = databaseProduk[selectedValue] || { hg: "0", hk: "0" }; 
            const hgString = produkData.hg; 
            const hkString = produkData.hk; 
            hgInput.value = (hgString.includes('&') || hgString.includes(',')) ? hgString : formatRupiah(hgString, false); 
            hkInput.value = (hkString.includes('&') || hkString.includes(',')) ? hkString : formatRupiah(hkString, false); 
        }
    }
    
    // --- (MODIFIKASI) Fungsi generateTeks ---
    function generateTeks(e) {
        e.preventDefault();
        
        const format = formatTypeSelect.value;
        const kka = document.getElementById('kka').value;
        const tanggal = tanggalInput.value;
        const namaToko = document.getElementById('nama-toko').value;
        const wilayah = document.getElementById('wilayah').value;
        const marketing = marketingInput.value;
            
        const pengajuan = { 
            id: new Date().getTime(), 
            namaToko: namaToko, 
            wilayah: wilayah, 
            kka: kka, 
            tanggal: tanggal, 
            marketing: marketing, 
            items: [] 
        };
        
        let teksFinal = "";
        let itemListText = "";
        
        const semuaItem = itemList.querySelectorAll('.card--item'); // Cari .card--item
        semuaItem.forEach((item, index) => {
            const mode = item.dataset.mode; 
            const nama = item.querySelector('.nama-barang-search').value; 
            const hk = item.querySelector('.harga-khusus').value; 
            const hg = item.querySelector('.harga-grosir').value; 
            const qty = item.querySelector('.kuantitas').value;
            
            if (nama && qty && hk) { 
                pengajuan.items.push({ nama: nama, hg: hg, hk: hk, qty: qty, isCustom: (mode === 'custom') }); 
                
                if (format === 'image-format') {
                    itemListText += `${nama}"@${qty}\n(${hk})\n`;
                } else {
                    itemListText += `${index + 1}. *_${nama}_*\n- HG "@ ${hg} \n- HK "@ ${hk}\n- Pengambilan : ${qty}\n\n`;
                }
            }
        });
        
        if (format === 'image-format') {
            teksFinal = `Pengajuan Harga\nKKA : ${kka}\nTanggal : ${tanggal}\nNama. : ${namaToko}\nWilayah: ${wilayah}\n\nNama Barang\n${itemListText}\nMarketing. Direktur\n${marketing}.`;
        } else {
            teksFinal = `📌 _Pengajuan Harga_\n_KKA :_ *${kka}*\n_Tanggal :_ ${tanggal}\n_Nama Toko:_ ${namaToko}\n_Wilayah:_ ${wilayah}\n\n${itemListText}`;
            teksFinal += `_Marketing_       _Direktur_\n\n     ${marketing}.       `;
        }
        
        hasilTeks.value = teksFinal; 
        hasilOutputSection.classList.remove('hidden'); // Tampilkan kartu hasil
        simpanRiwayat(pengajuan);
    }
    
    // --- (MODIFIKASI) Fungsi copyTeks ---
    function copyTeks() {
        if (!hasilTeks.value) { alert('Belum ada teks untuk di-copy!'); return; }
        navigator.clipboard.writeText(hasilTeks.value).then(() => { 
            tombolCopy.textContent = '✅ Berhasil!';
            setTimeout(() => { tombolCopy.textContent = '📋 Copy'; }, 2000); 
        }).catch(err => { alert('Gagal menyalin teks. Coba copy manual.'); });
    }
    
    // --- (Fungsi tidak berubah) ---
    function kirimViaWA() {
        const teks = hasilTeks.value; if (!teks) { alert('Belum ada teks untuk dikirim! Klik "Buat Teks" dulu.'); return; }
        const encodedTeks = encodeURIComponent(teks); const settings = getPengaturan(); const nomorWA = settings.nomorWA; let waLink = "";
        if (nomorWA) { let formattedNomor = nomorWA.replace(/[\s+()-]/g, ''); if (formattedNomor.startsWith('0')) { formattedNomor = '62' + formattedNomor.substring(1); } if (!formattedNomor.startsWith('62')) { formattedNomor = '62' + formattedNomor; } waLink = `https://api.whatsapp.com/send?phone=${formattedNomor}&text=${encodedTeks}`; }
        else { waLink = `https://api.whatsapp.com/send?text=${encodedTeks}`; alert('Nomor WA Tujuan belum diatur. Membuka WA untuk pilih kontak...\n\n(Buka "Pengaturan" untuk mengatur nomor tujuan default)'); }
        window.open(waLink, '_blank');
    }
    
    // --- (Fungsi tidak berubah) ---
    function formatRupiah(angka, pakaiRp = false) { let angkaString = String(angka).replace(/[^0-9]/g, ''); if (angkaString === '') return '0'; let number = Number(angkaString); if (number === 0) return '0'; let format = number.toLocaleString('id-ID'); return pakaiRp ? `Rp ${format}` : format; }
    
    // --- (MODIFIKASI) Fungsi Modal ---
    // Animasi modal sekarang dikontrol oleh CSS, tapi JS tetap sama
    function bukaModal(modal) { 
        modal.classList.remove('hidden'); 
        modalOverlay.classList.remove('hidden'); 
    }
    function tutupModal() { 
        modalPengaturan.classList.add('hidden'); 
        modalRiwayat.classList.add('hidden'); 
        modalOverlay.classList.add('hidden'); 
    }
    
    // --- (Fungsi tidak berubah) ---
    function getPengaturan() { try { const dataObfuscated = localStorage.getItem(KEY_PENGATURAN); if (!dataObfuscated) return { namaSales: '', nomorWA: '' }; const dataJson = atob(dataObfuscated); return JSON.parse(dataJson); } catch (e) { console.error("Gagal parse pengaturan:", e); localStorage.removeItem(KEY_PENGATURAN); return { namaSales: '', nomorWA: '' }; } }
    
    function loadPengaturan() { 
        const settings = getPengaturan(); 
        if (settings.namaSales) { 
            marketingInput.value = settings.namaSales; 
        } 
        namaSalesInput.value = settings.namaSales || ''; 
        nomorWaInput.value = settings.nomorWA || '';
        tanggalInput.value = getTanggalHariIni();
    }
    
    // --- (Fungsi tidak berubah) ---
    function simpanPengaturan() { const namaSalesDefault = namaSalesInput.value; const nomorWA = nomorWaInput.value; const settings = { namaSales: namaSalesDefault, nomorWA: nomorWA }; try { const dataJson = JSON.stringify(settings); const dataObfuscated = btoa(dataJson); localStorage.setItem(KEY_PENGATURAN, dataObfuscated); if(namaSalesDefault){ marketingInput.value = namaSalesDefault; } alert('Pengaturan berhasil disimpan!'); tutupModal(); } catch (e) { console.error("Gagal simpan pengaturan:", e); alert('Gagal menyimpan pengaturan.'); } }
    function getRiwayat() { try { const dataObfuscated = localStorage.getItem(KEY_RIWAYAT); if (!dataObfuscated) return []; const dataJson = atob(dataObfuscated); return JSON.parse(dataJson); } catch (e) { console.error("Gagal parse riwayat:", e); localStorage.removeItem(KEY_RIWAYAT); return []; } }
    function simpanKeStorage(riwayat) { try { const dataJson = JSON.stringify(riwayat); const dataObfuscated = btoa(dataJson); localStorage.setItem(KEY_RIWAYAT, dataObfuscated); } catch (e) { console.error("Gagal simpan riwayat:", e); alert('Gagal menyimpan riwayat.'); } }
    function simpanRiwayat(pengajuan) { let riwayat = getRiwayat(); riwayat.unshift(pengajuan); riwayat = riwayat.slice(0, 50); simpanKeStorage(riwayat); }
    function hapusItemRiwayat(id) { let riwayat = getRiwayat(); const riwayatBaru = riwayat.filter(p => p.id != id); simpanKeStorage(riwayatBaru); tampilkanRiwayat(riwayatSearchInput.value); }
    function hapusSemuaRiwayat() { if (confirm('Apakah kamu yakin ingin menghapus SEMUA riwayat pengajuan?')) { localStorage.removeItem(KEY_RIWAYAT); tampilkanRiwayat(); } }
    
    // --- (Fungsi tidak berubah) ---
    function tampilkanRiwayat(filterText = "") {
        riwayatList.innerHTML = ''; let riwayat = getRiwayat();
        if (filterText) { const filterLower = filterText.toLowerCase(); riwayat = riwayat.filter(pengajuan => pengajuan.namaToko.toLowerCase().includes(filterLower)); }
        if (riwayat.length === 0) { riwayatList.innerHTML = '<p>Tidak ada riwayat pengajuan (atau tidak ada hasil pencarian).</p>'; return; }
        riwayat.forEach(pengajuan => {
            const item = document.createElement('div'); item.className = 'riwayat-item'; item.dataset.id = pengajuan.id;
            let itemHtml = '<ul class="riwayat-item-list">'; pengajuan.items.forEach(barang => { const qtyInfo = barang.qty && barang.qty.trim() !== '' ? ` <strong>(${barang.qty})</strong>` : ''; itemHtml += `<li>${barang.nama}${qtyInfo}</li>`; }); itemHtml += '</ul>';
            item.innerHTML = `<button type="button" class="tombol-hapus-item" data-id="${pengajuan.id}">&times;</button><div class="riwayat-info"><strong>${pengajuan.namaToko}</strong><span>${pengajuan.tanggal}</span><span>${pengajuan.items.length} item</span></div>${itemHtml}`;
            riwayatList.appendChild(item);
        });
    }
    
    // --- (MODIFIKASI) Fungsi muatDariRiwayat ---
    function muatDariRiwayat(id) {
        const riwayat = getRiwayat(); const pengajuan = riwayat.find(p => p.id == id); if (!pengajuan) { alert('Error: Riwayat tidak ditemukan.'); return; }
        document.getElementById('nama-toko').value = pengajuan.namaToko; document.getElementById('wilayah').value = pengajuan.wilayah; document.getElementById('kka').value = pengajuan.kka; document.getElementById('tanggal').value = pengajuan.tanggal; document.getElementById('marketing').value = pengajuan.marketing;
        itemList.innerHTML = '';
        pengajuan.items.forEach((item, index) => {
            tambahBarang(); // Memanggil fungsi tambahBarang() yang sudah baru
            const blokBaru = itemList.lastElementChild; 
            const searchInput = blokBaru.querySelector('.nama-barang-search'); 
            const hgInput = blokBaru.querySelector('.harga-grosir'); 
            const hkInput = blokBaru.querySelector('.harga-khusus'); 
            const qtyInput = blokBaru.querySelector('.kuantitas');
            
            if (item.isCustom) { blokBaru.dataset.mode = 'custom'; searchInput.value = item.nama; searchInput.placeholder = 'Ketik Nama Produk Custom...'; }
            else { blokBaru.dataset.mode = 'standard'; searchInput.value = item.nama; }
            
            hgInput.value = item.hg; 
            hkInput.value = item.hk; 
            qtyInput.value = item.qty;
        });
        renumberBlocks();
        
        formatTypeSelect.value = 'hg-hk';
        formPengajuan.classList.remove('js-format-polos'); // Gunakan class yang baru
        
        tutupModal(); 
        alert('Data pengajuan berhasil dimuat!');
    }

    // --- (FUNGSI BARU) Logika Tema ---
    function toggleTema() {
        const body = document.body;
        body.classList.toggle('dark-mode');
        
        // Simpan preferensi
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem(KEY_TEMA, 'dark');
            tombolTema.textContent = '🌙'; // Ganti ikon
        } else {
            localStorage.setItem(KEY_TEMA, 'light');
            tombolTema.textContent = '☀️'; // Ganti ikon
        }
    }

    function loadTema() {
        const temaTersimpan = localStorage.getItem(KEY_TEMA);
        if (temaTersimpan === 'dark') {
            document.body.classList.add('dark-mode');
            tombolTema.textContent = '🌙';
        } else {
            document.body.classList.remove('dark-mode');
            tombolTema.textContent = '☀️';
        }
    }

    // --- BAGIAN 2: MENGHUBUNGKAN FUNGSI KE TOMBOL ---
    formPengajuan.addEventListener('submit', generateTeks);
    tombolCopy.addEventListener('click', copyTeks);
    tombolWA.addEventListener('click', kirimViaWA);
    tambahBarangBtn.addEventListener('click', tambahBarang);
    itemList.addEventListener('click', hapusBlokBarang);
    
    // Listener BARU untuk Tombol Tema
    tombolTema.addEventListener('click', toggleTema);
    
    // --- (MODIFIKASI) Listener Dropdown Format ---
    formatTypeSelect.addEventListener('change', (e) => {
        if (e.target.value === 'image-format') {
            formPengajuan.classList.add('js-format-polos'); // Ganti class
        } else {
            formPengajuan.classList.remove('js-format-polos'); // Ganti class
        }
    });
    
    // Listener Modal (tidak berubah)
    tombolPengaturan.addEventListener('click', () => { const settings = getPengaturan(); namaSalesInput.value = settings.namaSales || ''; nomorWaInput.value = settings.nomorWA || ''; bukaModal(modalPengaturan); });
    tombolRiwayat.addEventListener('click', () => { riwayatSearchInput.value = ""; tampilkanRiwayat(); bukaModal(modalRiwayat); });
    modalOverlay.addEventListener('click', tutupModal);
    semuaTombolTutup.forEach(tombol => tombol.addEventListener('click', tutupModal));
    simpanPengaturanBtn.addEventListener('click', simpanPengaturan);
    hapusRiwayatBtn.addEventListener('click', hapusSemuaRiwayat);
    
    // Listener Riwayat (tidak berubah)
    riwayatList.addEventListener('click', (e) => { if (e.target.classList.contains('tombol-hapus-item')) { e.stopPropagation(); const id = e.target.dataset.id; if (confirm('Hapus item riwayat ini?')) { hapusItemRiwayat(id); } } else if (e.target.closest('.riwayat-item')) { const id = e.target.closest('.riwayat-item').dataset.id; muatDariRiwayat(id); } });
    riwayatSearchInput.addEventListener('input', (e) => { tampilkanRiwayat(e.target.value); });
    
    // --- (MODIFIKASI) Listener Item List ---
    // Diperbarui untuk mencari .card--item
    itemList.addEventListener('input', (e) => { if (e.target.classList.contains('nama-barang-search')) { const searchTerm = e.target.value; const resultsContainer = e.target.closest('.search-container').querySelector('.search-results'); tampilkanHasilPencarian(searchTerm, resultsContainer); } });
    itemList.addEventListener('click', (e) => { if (e.target.classList.contains('result-item')) { const selectedValue = e.target.dataset.id; const itemBlock = e.target.closest('.card--item'); /* <-- DIUBAH */ const resultsContainer = e.target.closest('.search-results'); updateTampilanBarang(itemBlock, selectedValue); resultsContainer.classList.add('hidden'); } });
    document.addEventListener('click', (e) => { if (!e.target.closest('.search-container')) { document.querySelectorAll('.search-results').forEach(div => { div.classList.add('hidden'); }); } });

    // --- INISIALISASI HALAMAN ---
    loadTema(); // Muat tema (light/dark)
    loadPengaturan(); // Muat nama sales & set tanggal
    loadDatabase().then(() => {
        tambahBarang(); // Tambah blok barang pertama SETELAH DB sukses
    });

}); // <-- Kurung kurawal penutup AKHIR
