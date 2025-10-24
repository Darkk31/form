// File: script.js (V6.0 - Searchable Dropdown)

const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVm7A6LvL2chRGyir6vqY-4hcgGLCHIeL7WdWb5NkET9aihdc3py86gJfv2GGhPJ8OeyWmVRBUivf2/pub?output=csv';

let databaseProduk = {};
let daftarNamaProduk = []; // Daftar A-Z untuk pencarian cepat

document.addEventListener('DOMContentLoaded', () => {

    // (Ambil semua elemen Modal & Form, sama seperti V5.0)
    const formPengajuan = document.getElementById('form-pengajuan');
    const itemList = document.getElementById('item-list');
    const tambahBarangBtn = document.getElementById('tambah-barang-btn');
    const hasilTeks = document.getElementById('hasil-teks');
    const tombolCopy = document.getElementById('tombol-copy');
    const tanggalInput = document.getElementById('tanggal');
    const generateBtn = document.getElementById('generate-btn');
    const marketingInput = document.getElementById('marketing');
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

    // --- Fungsi Logika Inti ---

    async function loadDatabase() {
        console.log('Mulai mengambil data dari Google Sheet...');
        generateBtn.textContent = 'MEMUAT DATABASE...';
        generateBtn.disabled = true;

        try {
            const response = await fetch(googleSheetURL);
            if (!response.ok) throw new Error('Gagal mengambil data.');
            
            const csvData = await response.text();
            databaseProduk = {}; 
            
            const baris = csvData.split('\n');
            for (let i = 1; i < baris.length; i++) {
                const barisData = baris[i].trim();
                if (barisData) {
                    const pemisahHK = barisData.lastIndexOf(',');
                    const hk = barisData.substring(pemisahHK + 1).trim();
                    const sisa = barisData.substring(0, pemisahHK).trim();
                    const pemisahHG = sisa.lastIndexOf(',');
                    const hg = sisa.substring(pemisahHG + 1).trim();
                    const nama = sisa.substring(0, pemisahHG).trim().replace(/"/g, '');

                    if (nama && hg && hk) {
                        databaseProduk[nama] = { hg: hg, hk: hk };
                    }
                }
            }
            
            // Simpan daftar nama produk yang sudah di-sortir untuk pencarian
            daftarNamaProduk = Object.keys(databaseProduk).sort();
            
            console.log('Database berhasil dimuat:', databaseProduk);
            generateBtn.textContent = 'BUAT TEKS PENGAJUAN';
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Error saat memuat database:', error);
            alert('GAGAL MEMUAT DATABASE PRODUK. Pastikan Sheet kamu punya 3 kolom.');
            generateBtn.textContent = 'GAGAL MEMUAT DATA';
        }
    }

    // (getTanggalHariIni, renumberBlocks, hapusBlokBarang - SAMA SEPERTI V5.0)
    function getTanggalHariIni() {
        const today = new Date();
        const options = { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric' };
        const parts = new Intl.DateTimeFormat('en-GB', options).formatToParts(today);
        let day = '', month = '', year = '';
        for (const part of parts) {
            if (part.type === 'day') day = part.value;
            if (part.type === 'month') month = part.value;
            if (part.type === 'year') year = part.value;
        }
        return `${day}/${month}/${year}`;
    }

    function renumberBlocks() {
        const semuaItem = itemList.querySelectorAll('.item-block');
        semuaItem.forEach((item, index) => {
            item.querySelector('h4').textContent = `Barang ${index + 1}`;
        });
    }

    function hapusBlokBarang(e) {
        if (e.target.classList.contains('hapus-barang-btn')) {
            const semuaItem = itemList.querySelectorAll('.item-block');
            if (semuaItem.length <= 1) {
                alert('Tidak bisa menghapus blok barang terakhir!');
                return;
            }
            e.target.closest('.item-block').remove();
            renumberBlocks();
        }
    }

    // (isiOpsiProduk - DIHAPUS, tidak dipakai lagi)

    // ##### PERUBAHAN BESAR V6.0: Fungsi `tambahBarang` #####
    function tambahBarang() {
        const itemBlock = document.createElement('div');
        itemBlock.className = 'item-block';
        itemBlock.dataset.mode = 'standard'; // Mode default
        const nomorBarang = itemList.querySelectorAll('.item-block').length + 1;
        
        // Template HTML baru untuk V6.0
        itemBlock.innerHTML = `
            <h4>Barang ${nomorBarang}</h4>
            <label>Nama Barang:</label>
            <div class="search-container">
                <input type="text" class="nama-barang-search" placeholder="Ketik & Pilih Produk...">
                <div class="search-results hidden"></div>
            </div>
            
            <label>Harga Grosir (HG):</label>
            <input type="text" class="harga-grosir" placeholder="Otomatis">
            
            <label>Harga Khusus (HK):</label>
            <input type="text" class="harga-khusus" placeholder="Isi HK (Boleh teks & simbol)" required>
            
            <label>Pengambilan (Qty):</label>
            <input type="text" class="kuantitas" placeholder="Contoh: 5 dus" required>
            
            <button type="button" class="hapus-barang-btn">Hapus Barang</button>
        `;
        
        itemList.appendChild(itemBlock);
    }
    
    // ##### BARU V6.0: Fungsi untuk menampilkan hasil pencarian #####
    function tampilkanHasilPencarian(searchTerm, resultsContainer) {
        resultsContainer.innerHTML = ''; // Kosongkan
        resultsContainer.classList.remove('hidden');
        
        const filter = searchTerm.toLowerCase();
        let hasMatches = false;

        // Cari di database produk
        for (const namaProduk of daftarNamaProduk) {
            if (namaProduk.toLowerCase().includes(filter)) {
                const item = document.createElement('div');
                item.className = 'result-item';
                item.textContent = namaProduk;
                item.dataset.value = namaProduk;
                resultsContainer.appendChild(item);
                hasMatches = true;
            }
        }

        // Selalu tambahkan opsi "Produk Custom"
        const customItem = document.createElement('div');
        customItem.className = 'result-item';
        customItem.textContent = '-- Produk Custom (Isi Manual) --';
        customItem.dataset.value = '__custom';
        resultsContainer.appendChild(customItem);
    }

    // ##### MODIFIKASI V6.0: `updateTampilanBarang` sekarang dipanggil dari hasil pencarian #####
    function updateTampilanBarang(itemBlock, selectedValue) {
        const searchInput = itemBlock.querySelector('.nama-barang-search');
        const hgInput = itemBlock.querySelector('.harga-grosir');
        const hkInput = itemBlock.querySelector('.harga-khusus');
        
        if (selectedValue === "__custom") {
            // --- MODE CUSTOM ---
            itemBlock.dataset.mode = 'custom';
            searchInput.value = ''; // Kosongkan input
            searchInput.placeholder = 'Ketik Nama Produk Custom...';
            hgInput.value = ""; 
            hgInput.placeholder = "Isi HG Manual";
            hkInput.value = ""; 
            hkInput.placeholder = "Isi HK (Boleh teks & simbol)";
        } else {
            // --- MODE STANDAR ---
            itemBlock.dataset.mode = 'standard';
            searchInput.value = selectedValue; // Isi input dengan nama produk
            hgInput.placeholder = "Otomatis";
            hkInput.placeholder = "Otomatis";
            
            const produkData = databaseProduk[selectedValue] || { hg: "", hk: "" };
            const hgString = produkData.hg;
            const hkString = produkData.hk;
    
            hgInput.value = (hgString.includes('&') || hgString.includes(',')) ? hgString : formatRupiah(hgString);
            hkInput.value = (hkString.includes('&') || hkString.includes(',')) ? hkString : formatRupiah(hkString);
        }
    }
    
    // ##### MODIFIKASI V6.0: `generateTeks` sekarang membaca dari input pencarian #####
    function generateTeks(e) {
        e.preventDefault(); 
        
        const pengajuan = {
            id: new Date().getTime(),
            namaToko: document.getElementById('nama-toko').value,
            wilayah: document.getElementById('wilayah').value,
            kka: document.getElementById('kka').value,
            tanggal: tanggalInput.value,
            marketing: marketingInput.value,
            items: []
        };
        
        let teksFinal = `📌 _Pengajuan Harga_
_KKA :_ *${pengajuan.kka}*
_Tanggal :_ ${pengajuan.tanggal}
_Nama Toko:_ ${pengajuan.namaToko}
_Wilayah:_ ${pengajuan.wilayah}\n\n`;
        
        const semuaItem = itemList.querySelectorAll('.item-block');
        
        semuaItem.forEach((item, index) => {
            const mode = item.dataset.mode;
            const nama = item.querySelector('.nama-barang-search').value; // Ambil nama dari input pencarian
            const hk = item.querySelector('.harga-khusus').value;
            const hg = item.querySelector('.harga-grosir').value;
            const qty = item.querySelector('.kuantitas').value;
            
            if (nama && hk && qty) {
                // Simpan ke obyek riwayat
                pengajuan.items.push({
                    nama: nama, // Nama akan jadi nama custom ATAU nama produk
                    hg: hg,
                    hk: hk,
                    qty: qty,
                    isCustom: (mode === 'custom')
                });
                
                // Tambahkan ke teks
                teksFinal += `${index + 1}. *_${nama}_*
- HG "@ ${hg} 
- HK "@ ${hk}
- Pengambilan : ${qty}\n\n`;
            }
        });

        teksFinal += `_Marketing_       _Direktur_

     ${pengajuan.marketing}.       `;
        
        hasilTeks.value = teksFinal;
        simpanRiwayat(pengajuan);
    }
    
    // (copyTeks, formatRupiah - SAMA SEPERTI V5.0)
    function copyTeks() {
        if (!hasilTeks.value) {
            alert('Belum ada teks untuk di-copy!'); return;
        }
        navigator.clipboard.writeText(hasilTeks.value).then(() => {
            tombolCopy.textContent = 'BERHASIL DISALIN!';
            setTimeout(() => { tombolCopy.textContent = 'COPY TEKS'; }, 2000);
        }).catch(err => {
            alert('Gagal menyalin teks. Coba copy manual.');
        });
    }

    function formatRupiah(angka, pakaiRp = true) {
        let angkaString = String(angka).replace(/[^0-9]/g, '');
        if (angkaString === '') return '';
        let number = Number(angkaString);
        let format = number.toLocaleString('id-ID');
        return pakaiRp ? `Rp ${format}` : format;
    }

    // (Fungsi Modal: bukaModal, tutupModal - SAMA SEPERTI V5.0)
    function bukaModal(modal) {
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
    }

    function tutupModal() {
        modalPengaturan.classList.add('hidden');
        modalRiwayat.classList.add('hidden');
        modalOverlay.classList.add('hidden');
    }

    // (Fungsi Pengaturan: loadPengaturan, simpanPengaturan - SAMA SEPERTI V5.0)
    function loadPengaturan() {
        const namaSales = localStorage.getItem('namaSalesDefault');
        if (namaSales) {
            marketingInput.value = namaSales;
            namaSalesInput.value = namaSales;
        }
    }

    function simpanPengaturan() {
        const namaSales = namaSalesInput.value;
        if (namaSales) {
            localStorage.setItem('namaSalesDefault', namaSales);
            marketingInput.value = namaSales;
            alert('Nama sales berhasil disimpan!');
            tutupModal();
        } else {
            alert('Nama tidak boleh kosong.');
        }
    }

    // (Fungsi Riwayat: simpanRiwayat, tampilkanRiwayat, hapusItemRiwayat, hapusSemuaRiwayat - SAMA SEPERTI V5.0)
    function simpanRiwayat(pengajuan) {
        let riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        riwayat.unshift(pengajuan);
        riwayat = riwayat.slice(0, 50);
        localStorage.setItem('riwayatPengajuan', JSON.stringify(riwayat));
    }

    function tampilkanRiwayat() {
        riwayatList.innerHTML = '';
        const riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        if (riwayat.length === 0) {
            riwayatList.innerHTML = '<p>Tidak ada riwayat pengajuan.</p>';
            return;
        }
        riwayat.forEach(pengajuan => {
            const item = document.createElement('div');
            item.className = 'riwayat-item';
            item.dataset.id = pengajuan.id;
            item.innerHTML = `
                <button type="button" class="tombol-hapus-item" data-id="${pengajuan.id}">&times;</button>
                <strong>${pengajuan.namaToko}</strong><br>
                <span>${pengajuan.tanggal}</span>
                <span>${pengajuan.items.length} item</span>
            `;
            riwayatList.appendChild(item);
        });
    }

    function hapusItemRiwayat(id) {
        let riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        const riwayatBaru = riwayat.filter(p => p.id != id);
        localStorage.setItem('riwayatPengajuan', JSON.stringify(riwayatBaru));
        tampilkanRiwayat();
    }
    
    function hapusSemuaRiwayat() {
        if (confirm('Apakah kamu yakin ingin menghapus SEMUA riwayat pengajuan?')) {
            localStorage.removeItem('riwayatPengajuan');
            tampilkanRiwayat();
        }
    }

    // ##### MODIFIKASI V6.0: `muatDariRiwayat` sekarang mengisi input pencarian #####
    function muatDariRiwayat(id) {
        const riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        const pengajuan = riwayat.find(p => p.id == id);
        if (!pengajuan) { alert('Error: Riwayat tidak ditemukan.'); return; }

        document.getElementById('nama-toko').value = pengajuan.namaToko;
        document.getElementById('wilayah').value = pengajuan.wilayah;
        document.getElementById('kka').value = pengajuan.kka;
        document.getElementById('tanggal').value = pengajuan.tanggal;
        document.getElementById('marketing').value = pengajuan.marketing;
        
        itemList.innerHTML = ''; // Hapus blok barang
        
        pengajuan.items.forEach((item, index) => {
            tambahBarang(); // Buat blok baru (V6.0)
            const blokBaru = itemList.lastElementChild;
            
            const searchInput = blokBaru.querySelector('.nama-barang-search');
            const hgInput = blokBaru.querySelector('.harga-grosir');
            const hkInput = blokBaru.querySelector('.harga-khusus');
            const qtyInput = blokBaru.querySelector('.kuantitas');

            if (item.isCustom) {
                blokBaru.dataset.mode = 'custom';
                searchInput.value = item.nama; // Isi nama custom
                searchInput.placeholder = 'Ketik Nama Produk Custom...';
            } else {
                blokBaru.dataset.mode = 'standard';
                searchInput.value = item.nama; // Isi nama produk
            }

            hgInput.value = item.hg;
            hkInput.value = item.hk;
            qtyInput.value = item.qty;
        });
        
        renumberBlocks();
        tutupModal();
        alert('Data pengajuan berhasil dimuat!');
    }

    // --- BAGIAN 2: MENGHUBUNGKAN FUNGSI KE TOMBOL ---
    
    // (Tombol Utama)
    formPengajuan.addEventListener('submit', generateTeks);
    tombolCopy.addEventListener('click', copyTeks);
    tambahBarangBtn.addEventListener('click', tambahBarang);
    itemList.addEventListener('click', hapusBlokBarang);
    
    // (Tombol Modal)
    tombolPengaturan.addEventListener('click', () => {
        namaSalesInput.value = localStorage.getItem('namaSalesDefault') || '';
        bukaModal(modalPengaturan);
    });
    tombolRiwayat.addEventListener('click', () => {
        tampilkanRiwayat();
        bukaModal(modalRiwayat);
    });

    // (Tombol Tutup Modal)
    modalOverlay.addEventListener('click', tutupModal);
    semuaTombolTutup.forEach(tombol => tombol.addEventListener('click', tutupModal));
    
    // (Tombol Aksi Modal)
    simpanPengaturanBtn.addEventListener('click', simpanPengaturan);
    hapusRiwayatBtn.addEventListener('click', hapusSemuaRiwayat);

    // (Listener Riwayat List)
    riwayatList.addEventListener('click', (e) => {
        if (e.target.classList.contains('tombol-hapus-item')) {
            e.stopPropagation();
            const id = e.target.dataset.id;
            if (confirm('Hapus item riwayat ini?')) { hapusItemRiwayat(id); }
        }
        else if (e.target.closest('.riwayat-item')) {
            const id = e.target.closest('.riwayat-item').dataset.id;
            muatDariRiwayat(id);
        }
    });

    // ##### BARU V6.0: Event Listeners untuk Searchable Dropdown #####
    itemList.addEventListener('input', (e) => {
        // Jika yang diketik adalah kotak pencarian...
        if (e.target.classList.contains('nama-barang-search')) {
            const searchTerm = e.target.value;
            const resultsContainer = e.target.closest('.search-container').querySelector('.search-results');
            tampilkanHasilPencarian(searchTerm, resultsContainer);
        }
    });

    itemList.addEventListener('click', (e) => {
        // Jika yang diklik adalah item hasil pencarian...
        if (e.target.classList.contains('result-item')) {
            const selectedValue = e.target.dataset.value;
            const itemBlock = e.target.closest('.item-block');
            const resultsContainer = e.target.closest('.search-results');
            
            // Panggil fungsi update utama
            updateTampilanBarang(itemBlock, selectedValue);
            
            // Sembunyikan hasil
            resultsContainer.classList.add('hidden');
        }
    });

    // Sembunyikan hasil pencarian jika klik di luar
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            document.querySelectorAll('.search-results').forEach(div => {
                div.classList.add('hidden');
            });
        }
    });

    // --- INISIALISASI HALAMAN ---
    
    tanggalInput.value = getTanggalHariIni();
    loadPengaturan();
    loadDatabase();
    
});