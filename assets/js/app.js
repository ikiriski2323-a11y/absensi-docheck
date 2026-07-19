// File: assets/js/app.js

let dataKaryawanUtama = [];

// 1. Fungsi Jam & Hari Real-time
function updateTime() {
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('id-ID', optionsDate);
    document.getElementById('timeDisplay').textContent = now.toLocaleTimeString('id-ID').replace(/\./g, ':');
}
setInterval(updateTime, 1000);
updateTime();

// 2. Fungsi Deteksi & Cache Lokasi GPS (Harian)
function getLocation() {
    const today = new Date().toLocaleDateString('id-ID');
    const cachedDate = localStorage.getItem('gpsDate');
    const cachedLat = localStorage.getItem('gpsLat');
    const cachedLng = localStorage.getItem('gpsLng');
    const locStatus = document.getElementById('locationStatus');

    if (cachedDate === today && cachedLat && cachedLng) {
        if(document.getElementById('latitude')) document.getElementById('latitude').value = cachedLat;
        if(document.getElementById('longitude')) document.getElementById('longitude').value = cachedLng;
        if(locStatus) {
            locStatus.textContent = '✅ Lokasi berhasil ditemukan';
            locStatus.className = 'location-status successful';
        }
        return;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                if(document.getElementById('latitude')) document.getElementById('latitude').value = lat;
                if(document.getElementById('longitude')) document.getElementById('longitude').value = lng;
                localStorage.setItem('gpsDate', today);
                localStorage.setItem('gpsLat', lat);
                localStorage.setItem('gpsLng', lng);
                if(locStatus) {
                    locStatus.textContent = '✅ Lokasi berhasil ditemukan';
                    locStatus.className = 'location-status successful';
                }
            },
            function(error) {
                if(locStatus) {
                    locStatus.textContent = '❌ Akses lokasi ditolak/gagal';
                    locStatus.className = 'location-status failed';
                }
            }
        );
    }
}
getLocation();

// 3. Memuat Data Dropdown Karyawan dari Google Sheets saat Halaman Terbuka
document.addEventListener('DOMContentLoaded', async () => {
    const selectNama = document.getElementById('nama');
    if (!selectNama) return;
    
    dataKaryawanUtama = await getKaryawan(); 
    selectNama.innerHTML = '<option value="">-- Pilih Nama Karyawan --</option>';
    dataKaryawanUtama.forEach(karyawan => {
        selectNama.innerHTML += `<option value="${karyawan.nama}">${karyawan.nama}</option>`;
    });
});

// 4. Fitur Otomatis Isi (Autofill) Jabatan
const namaDropdown = document.getElementById('nama');
if (namaDropdown) {
    namaDropdown.addEventListener('change', function() {
        const selectedNama = this.value;
        const karyawan = dataKaryawanUtama.find(k => k.nama === selectedNama);
        if(document.getElementById('jabatan')) {
            document.getElementById('jabatan').value = karyawan ? karyawan.jabatan : '';
        }
    });
}

// Helper Format Tanggal Indonesia (dd/MM/yyyy) agar presisi dengan Sheets
function formatTanggal(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

// 5. CORE LOGIKA: Proses Pengiriman Seluruh Jenis Form Absensi
async function prosesAbsen(jenis) {
    const nama = document.getElementById('nama') ? document.getElementById('nama').value : '';
    const jabatan = document.getElementById('jabatan') ? document.getElementById('jabatan').value : '';
    const lat = document.getElementById('latitude') ? document.getElementById('latitude').value : '';
    const lng = document.getElementById('longitude') ? document.getElementById('longitude').value : '';
    
    if (!nama) return Swal.fire('Error', 'Silakan pilih nama terlebih dahulu!', 'error');
    
    // Proteksi GPS khusus untuk fitur berbasis lokasi fisik
    if ((jenis === 'Masuk' || jenis === 'Pulang' || jenis === 'Lapangan') && !lat) {
        return Swal.fire('Error', 'Menunggu GPS... Pastikan izin lokasi aktif.', 'error');
    }

    // Ubah UI tombol sementara menjadi efek memproses data
    const btn = document.querySelector(`.btn-${jenis.toLowerCase()}`) || document.querySelector('button[type="submit"]');
    const originalText = btn ? btn.textContent : 'Kirim';
    if (btn) {
        btn.textContent = 'Memproses...';
        btn.disabled = true;
    }

    const now = new Date();
    const tglHariIni = formatTanggal(now);

    // ==========================================
    // VALIDASI VALID KATEGORI PULANG (SINKRONISASI GET)
    // ==========================================
    if (jenis === 'Pulang') {
        const sudahAbsenMasuk = await cekSudahAbsenMasuk(nama, tglHariIni); 
        if (!sudahAbsenMasuk) {
            Swal.fire({
                title: 'Oops!',
                text: 'Anda belum melakukan absen masuk hari ini!',
                icon: 'error',
                confirmButtonColor: '#d93025'
            });
            if (btn) {
                btn.textContent = originalText;
                btn.disabled = false;
            }
            return; // Gagalkan pengiriman data ke spreadsheet
        }
    }

    // Struktur data global yang akan dikirim ke Sheets
    const payload = {
        type: jenis,
        tanggal: tglHariIni,
        nama: nama.trim(),
        jabatan: jabatan,
        lat: lat,
        lng: lng,
        status: 'Hadir',
        alasan: ''
    };

    // Ekstraksi data adaptif sesuai tipe form formulir
    if (jenis === 'Masuk') payload.jamMasuk = now.toLocaleTimeString('id-ID').replace(/\./g, ':');
    if (jenis === 'Pulang') payload.jamPulang = now.toLocaleTimeString('id-ID').replace(/\./g, ':');
    
    if (jenis === 'Lapangan') {
        const lokasiEl = document.getElementById('lokasiLapangan');
        payload.lokasi = lokasiEl ? lokasiEl.value : '';
        payload.url = `https://maps.google.com/?q=${lat},${lng}`;
        payload.jamCheckIn = now.toLocaleTimeString('id-ID').replace(/\./g, ':');
    }
    if (jenis === 'Cuti') {
        payload.tglPengajuan = tglHariIni;
        payload.jenisCuti = document.getElementById('jenisCuti') ? document.getElementById('jenisCuti').value : '';
        payload.tglMulai = document.getElementById('tglMulai') ? document.getElementById('tglMulai').value : '';
        payload.tglSelesai = document.getElementById('tglSelesai') ? document.getElementById('tglSelesai').value : '';
        payload.jmlHari = document.getElementById('jmlHari') ? document.getElementById('jmlHari').value : '';
        payload.alasan = document.getElementById('alasanCuti') ? document.getElementById('alasanCuti').value : '';
    }
    if (jenis === 'Lembur') {
        payload.tglPengajuan = tglHariIni;
        payload.tglLembur = document.getElementById('tglLembur') ? document.getElementById('tglLembur').value : '';
        payload.jamMulai = document.getElementById('jamMulai') ? document.getElementById('jamMulai').value : '';
        payload.jamSelesai = document.getElementById('jamSelesai') ? document.getElementById('jamSelesai').value : '';
        payload.totalJam = document.getElementById('totalJam') ? document.getElementById('totalJam').value : '';
        payload.alasan = document.getElementById('alasanLembur') ? document.getElementById('alasanLembur').value : '';
    }

    // Mengirim ke Google Spreadsheet
    const sukses = await kirimDataAbsen(payload);
    
    if (sukses) {
        Swal.fire({
            title: 'Berhasil!',
            text: `${jenis} berhasil dicatat!`,
            icon: 'success',
            confirmButtonColor: '#1e8e3e'
        }).then(() => {
            const form = document.getElementById('absensiForm');
            if(form) form.reset();
            if(document.getElementById('jabatan')) document.getElementById('jabatan').value = '';
        });
    } else {
        Swal.fire('Oops!', 'Terjadi masalah pengiriman jaringan.', 'error');
    }
    
    if (btn) {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}