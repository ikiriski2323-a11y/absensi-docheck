let dataKaryawanLembur = [];

document.addEventListener('DOMContentLoaded', async () => {
    const selectNama = document.getElementById('nama');
    dataKaryawanLembur = await getKaryawan(); 
    
    selectNama.innerHTML = '<option value="">-- Pilih Nama Karyawan --</option>';
    dataKaryawanLembur.forEach(karyawan => {
        selectNama.innerHTML += `<option value="${karyawan.nama}">${karyawan.nama}</option>`;
    });
});

document.getElementById('nama').addEventListener('change', function() {
    const selectedNama = this.value;
    const karyawan = dataKaryawanLembur.find(k => k.nama === selectedNama);
    document.getElementById('jabatan').value = karyawan ? karyawan.jabatan : '';
});

document.getElementById('lemburForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btnSubmit');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Memproses...';
    btnSubmit.disabled = true;

    const payload = {
        type: 'Lembur',
        tglPengajuan: formatTanggal(new Date()),
        nama: document.getElementById('nama').value,
        jabatan: document.getElementById('jabatan').value,
        tglLembur: formatTanggal(document.getElementById('tglLembur').value),
        jamMulai: document.getElementById('jamMulai').value,
        jamSelesai: document.getElementById('jamSelesai').value,
        totalJam: document.getElementById('totalJam').value, // Ini akan mengirim "5 jam"
        alasan: document.getElementById('alasan').value
    };

    const sukses = await kirimDataAbsen(payload);
    
    if (sukses) {
        Swal.fire({
            title: 'Berhasil!',
            text: 'Pengajuan Lembur berhasil dicatat!',
            icon: 'success',
            confirmButtonColor: '#1e8e3e'
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = '../index.html';
            }
        });
    } else {
        Swal.fire({
            title: 'Gagal!',
            text: 'Terjadi kesalahan jaringan.',
            icon: 'error',
            confirmButtonColor: '#d93025'
        });
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
    }
});

// Fungsi hitung otomatis jam lembur
function hitungJamLembur() {
    const mulai = document.getElementById('jamMulai').value;
    const selesai = document.getElementById('jamSelesai').value;
    
    if (mulai && selesai) {
        const [jamMulai, menitMulai] = mulai.split(':').map(Number);
        const [jamSelesai, menitSelesai] = selesai.split(':').map(Number);
        
        let totalMenit = (jamSelesai * 60 + menitSelesai) - (jamMulai * 60 + menitMulai);
        
        if (totalMenit < 0) {
            totalMenit += 24 * 60;
        }
        
        // KONVERSI KE JAM: Jika hasil bulat, hilangkan desimal. Jika ada sisa menit, gunakan desimal.
        const totalJam = totalMenit / 60;
        const displayJam = (totalJam % 1 === 0) ? Math.floor(totalJam) : totalJam.toFixed(1);
        
        document.getElementById('totalJam').value = displayJam + " jam";
    }
}

document.getElementById('jamMulai').addEventListener('change', hitungJamLembur);
document.getElementById('jamSelesai').addEventListener('change', hitungJamLembur);

function formatTanggal(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}