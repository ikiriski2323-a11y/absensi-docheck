// File: assets/js/lapangan.js

let dataKaryawanLapangan = [];

// 1. Memuat Data dari Spreadsheet saat halaman dibuka
document.addEventListener('DOMContentLoaded', async () => {
    const selectNama = document.getElementById('nama');
    
    // Menggunakan fungsi getKaryawan() dari api.js
    dataKaryawanLapangan = await getKaryawan(); 
    
    selectNama.innerHTML = '<option value="">-- Pilih Nama Karyawan --</option>';
    dataKaryawanLapangan.forEach(karyawan => {
        selectNama.innerHTML += `<option value="${karyawan.nama}">${karyawan.nama}</option>`;
    });
});

// 2. Autofill Jabatan
document.getElementById('nama').addEventListener('change', function() {
    const selectedNama = this.value;
    const karyawan = dataKaryawanLapangan.find(k => k.nama === selectedNama);
    document.getElementById('jabatan').value = karyawan ? karyawan.jabatan : '';
});

// 3. Menangani Pengiriman Form
document.getElementById('lapanganForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btnSubmit');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Memproses...';
    btnSubmit.disabled = true;

    const now = new Date();
    
    // Menyusun data sesuai permintaan di Spreadsheet
    const payload = {
        type: 'Lapangan',
        tanggal: formatTanggal(new Date()),
        nama: document.getElementById('nama').value,
        jabatan: document.getElementById('jabatan').value,
        lokasi: document.getElementById('lokasi').value,
        url: document.getElementById('url').value,
        jamCheckIn: now.toLocaleTimeString('id-ID')
    };

    // Mengirim ke API
    const sukses = await kirimDataAbsen(payload);
    
    if (sukses) {
        // MENGGUNAKAN SWEETALERT UNTUK SUKSES & PINDAH HALAMAN
        Swal.fire({
            title: 'Berhasil!',
            text: 'Absen Lapangan berhasil dicatat!',
            icon: 'success',
            confirmButtonColor: '#1e8e3e'
        }).then((result) => {
            // Pindah halaman hanya SETELAH tombol OK diklik
            if (result.isConfirmed) {
                window.location.href = '../index.html';
            }
        });
    } else {
        // MENGGUNAKAN SWEETALERT UNTUK ERROR
        Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan jaringan.',
            icon: 'error',
            confirmButtonColor: '#d93025'
        });
        btn.textContent = originalText;
        btn.disabled = false;
    }

});

// Fungsi Tanggal
function formatTanggal(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}