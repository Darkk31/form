// File: script.js (V10.0 - Search Engine di Riwayat)

// GANTI DENGAN LINK GOOGLE SHEET CSV KAMU
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRVm7A6LvL2chRGyir6vqY-4hcgGLCHIeL7WdWb5NkET9aihdc3py86gJfv2GGhPJ8OeyWmVRBUivf2/pub?output=csv';

let databaseProduk = {};
let daftarNamaProduk = []; 

document.addEventListener('DOMContentLoaded', () => {

    // (Ambil semua elemen Modal & Form)
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
    const tombolWA = document.getElementById('tombol-whatsapp');
    const nomorWaInput = document.getElementById('nomor-wa-direktur');

    // ##### PERUBAHAN V10.0 ADA DI SINI #####
    const riwayatSearchInput = document.getElementById('riwayat-search-input');

    // (loadDatabase - SAMA SEPERTI V9.0)
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
                    let nama = "", hg = "", hk = "";
                    const pemisah1 = barisData.lastIndexOf(',');
                    const col_Last = barisData.substring(pemisah1 + 1).trim().replace(/"/g, '');
                    const sisa1 = barisData.substring(0, pemisah1).trim();
                    if (sisa1 === "") { 
                        nama = col_Last; hg = "0"; hk = "0";
                    } else {
                        const pemisah2 = sisa1.lastIndexOf(',');
                        const col_Mid = sisa1.substring(pemisah2 + 1).trim().replace(/"/g, '');
                        const sisa2 = sisa1.substring(0, pemisah2).trim();
                        if (sisa2 === "") { 
                            if (col_Last === "" && col_Mid.length > 0) {
                                nama = col_Mid; hg = "0";
                            } else {
                                nama = col_Mid; hg = col_Last;
                            }
                            hk = "0";
                        } else { 
                            nama = sisa2.replace(/"/g, ''); 
                            hg = col_Mid; hk = col_Last;
                        }
                    }
                    if (nama.toLowerCase() === 'namaproduk') continue;
                    if (nama) {
                        databaseProduk[nama] = { 
                            hg: hg || "0", hk: hk || "0"
                        };
                    }
                }
            }
            
            daftarNamaProduk = Object.keys(databaseProduk).sort();
            console.log('Database berhasil dimuat:', databaseProduk);
            generateBtn.textContent = 'BUAT TEKS PENGAJUAN';
            generateBtn.disabled = false;
        } catch (error) {
            console.error('Error saat memuat database:', error);
            alert('GAGAL MEMUAT DATABASE PRODUK. Cek koneksi internet.');
            generateBtn.textContent = 'GAGAL MEMUAT DATA';
        }
    }

    // (getTanggalHariIni, renumberBlocks, hapusBlokBarang - SAMA SEPERTI V9.0)
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

    // (tambahBarang, tampilkanHasilPencarian, updateTampilanBarang - SAMA SEPERTI V9.0)
    function tambahBarang() {
        const itemBlock = document.createElement('div');
        itemBlock.className = 'item-block';
        itemBlock.dataset.mode = 'standard'; 
        const nomorBarang = itemList.querySelectorAll('.item-block').length + 1;
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
    function tampilkanHasilPencarian(searchTerm, resultsContainer) {
        resultsContainer.innerHTML = ''; 
        resultsContainer.classList.remove('hidden');
        const filter = searchTerm.toLowerCase();
        let hasMatches = false;
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
        const customItem = document.createElement('div');
        customItem.className = 'result-item';
        customItem.textContent = '-- Produk Custom (Isi Manual) --';
        customItem.dataset.value = '__custom';
        resultsContainer.appendChild(customItem);
    }
    function updateTampilanBarang(itemBlock, selectedValue) {
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
    
    // (generateTeks, copyTeks, kirimViaWA, formatRupiah - SAMA SEPERTI V9.0)
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
            const nama = item.querySelector('.nama-barang-search').value;
            const hk = item.querySelector('.harga-khusus').value;
            const hg = item.querySelector('.harga-grosir').value;
            const qty = item.querySelector('.kuantitas').value;
            if (nama && hk && qty) {
                pengajuan.items.push({
                    nama: nama, hg: hg, hk: hk, qty: qty,
                    isCustom: (mode === 'custom')
                });
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
    function kirimViaWA() {
        const teks = hasilTeks.value;
        if (!teks) {
            alert('Belum ada teks untuk dikirim! Klik "Buat Teks Pengajuan" dulu.');
            return;
        }
        const encodedTeks = encodeURIComponent(teks);
        const nomorWA = localStorage.getItem('nomorWaDirektur');
        let waLink = "";
        if (nomorWA) {
            let formattedNomor = nomorWA.replace(/[\s+()-]/g, '');
            if (formattedNomor.startsWith('0')) {
                formattedNomor = '62' + formattedNomor.substring(1);
            }
            if (!formattedNomor.startsWith('62')) {
                formattedNomor = '62' + formattedNomor;
            }
            waLink = `https://api.whatsapp.com/send?phone=${formattedNomor}&text=${encodedTeks}`;
        } else {
            waLink = `https://api.whatsapp.com/send?text=${encodedTeks}`;
            alert('Nomor WA Tujuan belum diatur. Membuka WA untuk pilih kontak...\n\n(Buka "Pengaturan" untuk mengatur nomor tujuan default)');
        }
        window.open(waLink, '_blank');
    }
    function formatRupiah(angka, pakaiRp = false) {
        let angkaString = String(angka).replace(/[^0-9]/g, '');
        if (angkaString === '') return '0'; 
        let number = Number(angkaString);
        if (number === 0) return '0'; 
        let format = number.toLocaleString('id-ID');
        return pakaiRp ? `Rp ${format}` : format;
    }

    // (Fungsi Modal: bukaModal, tutupModal - SAMA SEPERTI V9.0)
    function bukaModal(modal) {
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
    }
    function tutupModal() {
        modalPengaturan.classList.add('hidden');
        modalRiwayat.classList.add('hidden');
        modalOverlay.classList.add('hidden');
    }

    // (Fungsi Pengaturan: loadPengaturan, simpanPengaturan - SAMA SEPERTI V9.0)
    function loadPengaturan() {
        const namaSales = localStorage.getItem('namaSalesDefault');
        if (namaSales) {
            marketingInput.value = namaSales;
            namaSalesInput.value = namaSales;
        }
    }
    function simpanPengaturan() {
        const namaSales = namaSalesInput.value;
        const nomorWA = nomorWaInput.value;
        if (namaSales) {
            localStorage.setItem('namaSalesDefault', namaSales);
            marketingInput.value = namaSales;
        } else {
            alert('Nama sales tidak boleh kosong.');
            return;
        }
        localStorage.setItem('nomorWaDirektur', nomorWA);
        alert('Pengaturan berhasil disimpan!');
        tutupModal();
    }
    
    // (Fungsi Riwayat: simpanRiwayat, hapusItemRiwayat, hapusSemuaRiwayat - SAMA SEPERTI V9.0)
    function simpanRiwayat(pengajuan) {
        let riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        riwayat.unshift(pengajuan);
        riwayat = riwayat.slice(0, 50);
        localStorage.setItem('riwayatPengajuan', JSON.stringify(riwayat));
    }
    function hapusItemRiwayat(id) {
        let riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        const riwayatBaru = riwayat.filter(p => p.id != id);
        localStorage.setItem('riwayatPengajuan', JSON.stringify(riwayatBaru));
        tampilkanRiwayat(riwayatSearchInput.value); // Tampilkan ulang DENGAN filter
    }
    function hapusSemuaRiwayat() {
        if (confirm('Apakah kamu yakin ingin menghapus SEMUA riwayat pengajuan?')) {
            localStorage.removeItem('riwayatPengajuan');
            tampilkanRiwayat(); // Tampilkan ulang (jadi kosong)
        }
    }

    // ##### PERUBAHAN BESAR V10.0 ADA DI SINI #####
    // --- FUNGSI TAMPILKAN RIWAYAT (Di-upgrade dengan filter) ---
    function tampilkanRiwayat(filterText = "") { // Terima parameter filter
        riwayatList.innerHTML = ''; // Kosongkan daftar
        let riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];

        // Filter riwayat jika ada filterText
        if (filterText) {
            const filterLower = filterText.toLowerCase();
            riwayat = riwayat.filter(pengajuan => 
                pengajuan.namaToko.toLowerCase().includes(filterLower)
            );
        }

        if (riwayat.length === 0) {
            riwayatList.innerHTML = '<p>Tidak ada riwayat pengajuan (atau tidak ada hasil pencarian).</p>';
            return;
        }

        riwayat.forEach(pengajuan => {
            const item = document.createElement('div');
            item.className = 'riwayat-item';
            item.dataset.id = pengajuan.id; 
            
            let itemHtml = '<ul class="riwayat-item-list">';
            pengajuan.items.forEach(barang => {
                const qtyInfo = barang.qty && barang.qty.trim() !== '' ? ` <strong>(${barang.qty})</strong>` : '';
                itemHtml += `<li>${barang.nama}${qtyInfo}</li>`;
            });
            itemHtml += '</ul>';

            item.innerHTML = `
                <button type="button" class="tombol-hapus-item" data-id="${pengajuan.id}">&times;</button>
                <div class="riwayat-info">
                    <strong>${pengajuan.namaToko}</strong>
                    <span>${pengajuan.tanggal}</span>
                    <span>${pengajuan.items.length} item</span>
                </div>
                ${itemHtml}
            `;
            
            riwayatList.appendChild(item);
        });
    }

    // (muatDariRiwayat - SAMA SEPERTI V9.0)
    function muatDariRiwayat(id) {
        const riwayat = JSON.parse(localStorage.getItem('riwayatPengajuan')) || [];
        const pengajuan = riwayat.find(p => p.id == id);
        if (!pengajuan) { alert('Error: Riwayat tidak ditemukan.'); return; }

        document.getElementById('nama-toko').value = pengajuan.namaToko;
        document.getElementById('wilayah').value = pengajuan.wilayah;
        document.getElementById('kka').value = pengajuan.kka;
        document.getElementById('tanggal').value = pengajuan.tanggal;
        document.getElementById('marketing').value = pengajuan.marketing;
        itemList.innerHTML = ''; 
        pengajuan.items.forEach((item, index) => {
            tambahBarang(); 
            const blokBaru = itemList.lastElementChild;
            const searchInput = blokBaru.querySelector('.nama-barang-search');
            const hgInput = blokBaru.querySelector('.harga-grosir');
            const hkInput = blokBaru.querySelector('.harga-khusus');
            const qtyInput = blokBaru.querySelector('.kuantitas');
            if (item.isCustom) {
                blokBaru.dataset.mode = 'custom';
                searchInput.value = item.nama; 
                searchInput.placeholder = 'Ketik Nama Produk Custom...';
            } else {
                blokBaru.dataset.mode = 'standard';
                searchInput.value = item.nama; 
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
    
    // (Listener Tombol Utama - SAMA SEPERTI V9.0)
    formPengajuan.addEventListener('submit', generateTeks);
    tombolCopy.addEventListener('click', copyTeks);
    tombolWA.addEventListener('click', kirimViaWA);
    tambahBarangBtn.addEventListener('click', tambahBarang);
    itemList.addEventListener('click', hapusBlokBarang);
    
    // ##### LISTENER TOMBOL PENGATURAN & RIWAYAT (Di-upgrade V10.0) #####
    tombolPengaturan.addEventListener('click', () => {
        namaSalesInput.value = localStorage.getItem('namaSalesDefault') || '';
        nomorWaInput.value = localStorage.getItem('nomorWaDirektur') || '';
        bukaModal(modalPengaturan);
    });
    
    tombolRiwayat.addEventListener('click', () => {
        riwayatSearchInput.value = ""; // Kosongkan search bar setiap kali modal dibuka
        tampilkanRiwayat(); // Tampilkan semua riwayat
        bukaModal(modalRiwayat);
    });
    
    // (Listener Modal & Riwayat - SAMA SEPERTI V9.0)
    modalOverlay.addEventListener('click', tutupModal);
    semuaTombolTutup.forEach(tombol => tombol.addEventListener('click', tutupModal));
    simpanPengaturanBtn.addEventListener('click', simpanPengaturan);
    hapusRiwayatBtn.addEventListener('click', hapusSemuaRiwayat);
    riwayatList.addEventListener('click', (e) => {
        if (e.target.classList.contains('tombol-hapus-item')) {
            e.stopPropagation();
            const id = e.target.dataset.id;
            if (confirm('Hapus item riwayat ini?')) { 
                // Perbarui daftar riwayat SETELAH menghapus
                hapusItemRiwayat(id);
            }
        }
        else if (e.target.closest('.riwayat-item')) {
            const id = e.target.closest('.riwayat-item').dataset.id;
            muatDariRiwayat(id);
        }
    });

    // ##### LISTENER BARU V10.0 #####
    // Listener untuk search riwayat
    riwayatSearchInput.addEventListener('input', (e) => {
        tampilkanRiwayat(e.target.value); // Panggil fungsi tampilkan DENGAN filter
    });

    // (Listener Pencarian - SAMA SEPERTI V9.0)
    itemList.addEventListener('input', (e) => {
        if (e.target.classList.contains('nama-barang-search')) {
            const searchTerm = e.target.value;
            const resultsContainer = e.target.closest('.search-container').querySelector('.search-results');
            tampilkanHasilPencarian(searchTerm, resultsContainer);
        }
    });
    itemList.addEventListener('click', (e) => {
        if (e.target.classList.contains('result-item')) {
            const selectedValue = e.target.dataset.value;
            const itemBlock = e.target.closest('.item-block');
            const resultsContainer = e.target.closest('.search-results');
            updateTampilanBarang(itemBlock, selectedValue);
            resultsContainer.classList.add('hidden');
        }
    });
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
