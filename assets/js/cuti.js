let dataKaryawanCuti = [];

document.addEventListener('DOMContentLoaded', async () => {
    const selectNama = document.getElementById('nama');
    dataKaryawanCuti = await getKaryawan(); 
    
    selectNama.innerHTML = '<option value="">-- Pilih Nama Karyawan --</option>';
    dataKaryawanCuti.forEach(karyawan => {
        selectNama.innerHTML += `<option value="${karyawan.nama}">${karyawan.nama}</option>`;
    });
});

document.getElementById('nama').addEventListener('change', function() {
    const selectedNama = this.value;
    const karyawan = dataKaryawanCuti.find(k => k.nama === selectedNama);
    document.getElementById('jabatan').value = karyawan ? karyawan.jabatan : '';
});

document.getElementById('cutiForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btnSubmit');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Memproses...';
    btnSubmit.disabled = true;

    const payload = {
        type: 'Cuti',
        tglPengajuan: formatTanggal(new Date()),
        nama: document.getElementById('nama').value,
        jabatan: document.getElementById('jabatan').value,
        jenisCuti: document.getElementById('jenisCuti').value,
        tglMulai: formatTanggal(document.getElementById('tglMulai').value),
        tglSelesai: formatTanggal(document.getElementById('tglSelesai').value),
        jmlHari: document.getElementById('jmlHari').value,
        alasan: document.getElementById('alasan').value
    };

    const sukses = await kirimDataAbsen(payload);
    
    if (sukses) {
        // MENGGUNAKAN SWEETALERT UNTUK SUKSES & PINDAH HALAMAN
        Swal.fire({
            title: 'Berhasil!',
            text: 'Pengajuan Cuti berhasil dicatat!',
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

// Fungsi hitung otomatis hari cuti
function hitungHariCuti() {
    const mulai = document.getElementById('tglMulai').value;
    const selesai = document.getElementById('tglSelesai').value;
    
    if (mulai && selesai) {
        const date1 = new Date(mulai);
        const date2 = new Date(selesai);
        const diffTime = date2 - date1;
        // Dibagi milliseconds dalam 1 hari, lalu ditambah 1 agar hari H dihitung
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
        
        if (diffDays > 0) {
            document.getElementById('jmlHari').value = diffDays;
        } else {
            document.getElementById('jmlHari').value = '';
            alert('Tanggal selesai tidak boleh lebih cepat dari tanggal mulai!');
        }
    }
}

// Pasang pendeteksi perubahan
document.getElementById('tglMulai').addEventListener('change', hitungHariCuti);
document.getElementById('tglSelesai').addEventListener('change', hitungHariCuti);

// Fungsi Tanggal
function formatTanggal(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}