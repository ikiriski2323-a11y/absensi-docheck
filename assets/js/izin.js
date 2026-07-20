// File: assets/js/izin.js

let dataKaryawanIzin = [];

// 1. Memuat Data dari Spreadsheet saat halaman dibuka
document.addEventListener('DOMContentLoaded', async () => {
    const selectNama = document.getElementById('nama');
    dataKaryawanIzin = await getKaryawan(); 
    
    selectNama.innerHTML = '<option value="">-- Pilih Nama Karyawan --</option>';
    dataKaryawanIzin.forEach(karyawan => {
        selectNama.innerHTML += `<option value="${karyawan.nama}">${karyawan.nama}</option>`;
    });
});

// 2. Autofill Jabatan
document.getElementById('nama').addEventListener('change', function() {
    const selectedNama = this.value;
    const karyawan = dataKaryawanIzin.find(k => k.nama === selectedNama);
    document.getElementById('jabatan').value = karyawan ? karyawan.jabatan : '';
});

// 3. Menangani Pengiriman Form Izin
document.getElementById('izinForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btnSubmit');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Memproses...';
    btnSubmit.disabled = true;

    // Gabungkan alasan utama dan detail keterangan
    const alasanUtama = document.getElementById('alasan').value;
    const detailKeterangan = document.getElementById('keterangan').value;
    const alasanGabungan = alasanUtama + ' | ' + detailKeterangan;

    const payload = {
        type: 'Izin',
        tanggal: formatTanggal(new Date()),
        nama: document.getElementById('nama').value,
        jabatan: document.getElementById('jabatan').value,
        status: 'Izin',
        alasan: alasanGabungan,
        jamMasuk: '-', 
        lat: '-', 
        lng: '-'
    };

    const sukses = await kirimDataAbsen(payload);
    
    if (sukses) {
        // MENGGUNAKAN SWEETALERT UNTUK SUKSES & PINDAH HALAMAN
        Swal.fire({
            title: 'Berhasil!',
            text: 'Pengajuan Izin berhasil dicatat!',
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
