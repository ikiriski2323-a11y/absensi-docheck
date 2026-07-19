// File: assets/js/api.js

// Ambil data karyawan untuk dropdown select
async function getKaryawan() {
    try {
        const response = await fetch(CONFIG.API_URL);
        return await response.json();
    } catch (error) {
        console.error("Gagal mengambil data karyawan:", error);
        return [];
    }
}

// Cek status ke server apakah sudah absen masuk hari ini
async function cekSudahAbsenMasuk(nama, tanggal) {
    try {
        const response = await fetch(`${CONFIG.API_URL}?action=check&nama=${encodeURIComponent(nama)}&tanggal=${tanggal}`);
        const data = await response.json();
        return data.exists; // Mengembalikan true atau false
    } catch (error) {
        console.error("Gagal mengecek status absen:", error);
        return false;
    }
}

// Mengirimkan data formulir (Masuk/Pulang/Lapangan/Cuti/Lembur) ke server
async function kirimDataAbsen(payload) {
    try {
        await fetch(CONFIG.API_URL, {
            method: 'POST',
            mode: 'no-cors', // Metode paling aman agar tidak terblokir CORS browser
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return true;
    } catch (error) {
        console.error("Gagal mengirim data:", error);
        return false;
    }
}