// ==========================================
// KONFIGURASI URL GOOGLE APPS SCRIPT
// ==========================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxqhdGMabBdUHdXHTnqdfhNt7ZlJbVBaQ8vFlib1LWK6VybbfCXRU_tIwtrrlrcphtT/exec";

let globalData = []; // Menyimpan data dari database sementara
let myChart = null; // Variable global untuk Chart.js

// Format Rupiah
const formatRp = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
};

// ==========================================
// FUNGSI NAVIGASI (DENGAN UI BARU)
// ==========================================
function switchTab(tabName) {
    document.querySelectorAll('.page-section').forEach(el => el.classList.add('hidden-page'));
    document.getElementById(tabName).classList.remove('hidden-page');

    // Reset styles
    ['dashboard', 'statistik', 'history', 'kalkulator'].forEach(tab => {
        if(document.getElementById('nav-mobile-' + tab)) {
            document.getElementById('nav-mobile-' + tab).className = "flex flex-col items-center text-gray-400 hover:text-brand-500 w-14 transition-colors";
        }
        if(document.getElementById('nav-desktop-' + tab)) {
            document.getElementById('nav-desktop-' + tab).className = "nav-btn flex items-center px-4 py-3.5 text-gray-500 hover:bg-gray-50 hover:text-brand-600 rounded-xl transition-all duration-300";
        }
    });

    // Active styles
    if(document.getElementById('nav-mobile-' + tabName)) {
        document.getElementById('nav-mobile-' + tabName).className = "flex flex-col items-center text-brand-600 w-14 transition-colors";
    }
    if(document.getElementById('nav-desktop-' + tabName)) {
        document.getElementById('nav-desktop-' + tabName).className = "nav-btn flex items-center px-4 py-3.5 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/20 transition-all duration-300";
    }
}

// ==========================================
// FUNGSI FETCH DATA DARI GOOGLE SHEETS
// ==========================================
async function fetchData() {
    if (SCRIPT_URL === "URL_GAS_KAMU_DISINI") {
        Swal.fire('Error', 'Kamu belum memasukkan URL Google Apps Script di kode HTML!', 'error');
        return;
    }

    const loaderHTML = `<div class="p-10 text-center text-gray-400"><div class="loader mb-3"></div><span class="text-sm">Menyinkronkan data...</span></div>`;
    document.getElementById('recent-transactions').innerHTML = loaderHTML;
    document.getElementById('history-container').innerHTML = loaderHTML;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=read`);
        const result = await response.json();
        
        if (result.success) {
            globalData = result.data.reverse(); // Balik array agar data terbaru di atas
            renderDashboard(globalData);
            renderHistory(globalData);
            renderStatistik(globalData); // Render Chart
        } else {
            Swal.fire('Gagal', result.message, 'error');
        }
    } catch (error) {
        Swal.fire('Koneksi Gagal', 'Gagal mengambil data dari server.', 'error');
        console.error(error);
    }
}

// ==========================================
// RENDER DASHBOARD & KALKULASI SALDO
// ==========================================
function renderDashboard(data) {
    let totalMasuk = 0;
    let totalKeluar = 0;

    data.forEach(item => {
        let nominal = parseInt(item.nominal) || 0;
        if (item.jenis.toLowerCase() === 'pemasukan') totalMasuk += nominal;
        if (item.jenis.toLowerCase() === 'pengeluaran') totalKeluar += nominal;
    });

    document.getElementById('saldo-masuk').innerText = formatRp(totalMasuk);
    document.getElementById('saldo-keluar').innerText = formatRp(totalKeluar);
    document.getElementById('saldo-total').innerText = formatRp(totalMasuk - totalKeluar);

    // Render 3 Transaksi Terbaru (Disesuaikan dengan UI Baru)
    const recentData = data.slice(0, 3);
    let html = '';
    
    if (recentData.length === 0) {
        html = '<div class="p-8 text-center text-gray-400 text-sm">Belum ada transaksi bulan ini.</div>';
    } else {
        recentData.forEach((item, index) => {
            const isMasuk = item.jenis.toLowerCase() === 'pemasukan';
            const isLast = index === recentData.length - 1;
            
            html += `
            <div class="flex justify-between items-center p-5 ${!isLast ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl flex justify-center items-center shrink-0 shadow-sm ${isMasuk ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}">
                        <i class="fa-solid ${isMasuk ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-lg"></i>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 tracking-tight leading-tight mb-0.5">${item.keterangan}</p>
                        <p class="text-[11px] font-medium text-gray-500">${item.tanggal} &bull; ${item.kategori}</p>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <p class="font-bold text-sm ${isMasuk ? 'text-green-600' : 'text-gray-800'}">${isMasuk ? '+' : '-'}${formatRp(item.nominal)}</p>
                </div>
            </div>`;
        });
    }
    document.getElementById('recent-transactions').innerHTML = html;
}

// ==========================================
// RENDER RIWAYAT & CRUD UI (DENGAN UI BARU)
// ==========================================
function renderHistory(data) {
    let html = '';
    if (data.length === 0) {
        html = '<div class="p-10 text-center text-gray-400 text-sm">Belum ada data transaksi yang sesuai.</div>';
    } else {
        data.forEach((item, index) => {
            const isMasuk = item.jenis.toLowerCase() === 'pemasukan';
            const itemJSON = JSON.stringify(item).replace(/'/g, "&apos;").replace(/"/g, "&quot;");
            const isLast = index === data.length - 1;
            
            html += `
            <div class="p-5 ${!isLast ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="flex items-start md:items-center gap-4">
                    <div class="w-12 h-12 rounded-2xl flex justify-center items-center shrink-0 shadow-sm ${isMasuk ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}">
                        <i class="fa-solid ${isMasuk ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'} text-lg"></i>
                    </div>
                    <div>
                        <p class="font-bold text-gray-800 tracking-tight mb-1">${item.keterangan}</p>
                        <div class="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500 mb-1.5">
                            <span class="flex items-center"><i class="fa-regular fa-calendar mr-1"></i>${item.tanggal}</span>
                            <span>&bull;</span>
                            <span class="flex items-center"><i class="fa-regular fa-user mr-1"></i>${item.pic}</span>
                        </div>
                        <span class="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] rounded-lg uppercase tracking-wider font-semibold border border-gray-200">${item.kategori}</span>
                    </div>
                </div>
                <div class="flex items-center justify-between md:flex-col md:items-end w-full md:w-auto mt-2 md:mt-0">
                    <p class="font-bold text-lg md:mb-2 ${isMasuk ? 'text-green-600' : 'text-gray-800'}">${isMasuk ? '+' : '-'}${formatRp(item.nominal)}</p>
                    <div class="flex space-x-2">
                        <button onclick="editData('${itemJSON}')" class="w-9 h-9 flex justify-center items-center bg-gray-50 text-gray-600 rounded-xl hover:bg-brand-50 hover:text-brand-600 border border-gray-100 transition-colors shadow-sm" title="Edit"><i class="fa-solid fa-pen text-xs"></i></button>
                        <button onclick="deleteData('${item.id}')" class="w-9 h-9 flex justify-center items-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white border border-red-100 transition-colors shadow-sm" title="Hapus"><i class="fa-solid fa-trash text-xs"></i></button>
                    </div>
                </div>
            </div>`;
        });
    }
    document.getElementById('history-container').innerHTML = html;
}

// ==========================================
// FUNGSI RENDER STATISTIK (CHART.JS)
// ==========================================
function renderStatistik(data) {
    const ctx = document.getElementById('chartPengeluaran');
    if(!ctx) return;

    // Filter khusus pengeluaran dan kumpulkan berdasarkan kategori
    const pengeluaran = data.filter(d => d.jenis.toLowerCase() === 'pengeluaran');
    const rekap = {};
    pengeluaran.forEach(item => {
        rekap[item.kategori] = (rekap[item.kategori] || 0) + parseInt(item.nominal);
    });

    // Hapus chart lama jika ada agar tidak nimpa saat refresh
    if(myChart) myChart.destroy();

    // Jika belum ada data pengeluaran
    if(Object.keys(rekap).length === 0) {
        ctx.parentElement.innerHTML = '<p class="text-center text-sm text-gray-400 py-10">Belum ada data pengeluaran untuk dianalisis.</p><canvas id="chartPengeluaran" class="hidden"></canvas>';
        return;
    }

    // Buat chart Doughnut baru dengan UI yang disesuaikan
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(rekap),
            datasets: [{
                data: Object.values(rekap),
                backgroundColor: ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#64748b'],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { family: "'Montserrat', sans-serif", size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.9)',
                    titleFont: { family: "'Montserrat', sans-serif", size: 13 },
                    bodyFont: { family: "'Montserrat', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) label += ': ';
                            if (context.parsed !== null) {
                                label += new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(context.parsed);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

// ==========================================
// FUNGSI KALKULATOR
// ==========================================
let calcExpression = "";
const calcDisplay = document.getElementById('calc-display');

function calcInput(char) {
    if(!calcDisplay) return;
    if(calcExpression === "0" && char !== ".") calcExpression = "";
    calcExpression += char;
    calcDisplay.innerText = calcExpression;
}

function calcClear() {
    if(!calcDisplay) return;
    calcExpression = "";
    calcDisplay.innerText = "0";
}

function calcResult() {
    if(!calcDisplay) return;
    try {
        let hitung = eval(calcExpression);
        if (hitung === Infinity || isNaN(hitung)) throw new Error("Math Error");
        
        calcExpression = hitung.toString();
        calcDisplay.innerText = new Intl.NumberFormat('id-ID').format(hitung);
    } catch (error) {
        calcDisplay.innerText = "Error";
        calcExpression = "";
    }
}

// ==========================================
// FUNGSI MODAL & FORM (CREATE & UPDATE)
// ==========================================
function openModal() {
    document.getElementById('form-modal').classList.remove('hidden');
    document.getElementById('transaksi-form').reset();
    document.getElementById('transaksi-id').value = '';
    document.getElementById('modal-title').innerText = 'Tambah Transaksi';
    
    // Set default tanggal hari ini
    document.getElementById('tanggal').value = new Date().toISOString().split('T')[0];
}

function closeModal() {
    document.getElementById('form-modal').classList.add('hidden');
}

function editData(itemString) {
    const item = JSON.parse(itemString.replace(/&quot;/g, '"').replace(/&apos;/g, "'"));
    document.getElementById('form-modal').classList.remove('hidden');
    document.getElementById('modal-title').innerText = 'Edit Transaksi';
    
    document.getElementById('transaksi-id').value = item.id;
    document.getElementById('tanggal').value = item.tanggal;
    document.getElementById('jenis').value = item.jenis;
    document.getElementById('nominal').value = item.nominal;
    document.getElementById('kategori').value = item.kategori;
    document.getElementById('keterangan').value = item.keterangan;
    document.getElementById('pic').value = item.pic;
}

async function submitData(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btn-submit');
    btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Menyimpan...';
    btnSubmit.disabled = true;

    const id = document.getElementById('transaksi-id').value;
    const payload = {
        tanggal: document.getElementById('tanggal').value,
        jenis: document.getElementById('jenis').value,
        nominal: document.getElementById('nominal').value,
        kategori: document.getElementById('kategori').value,
        keterangan: document.getElementById('keterangan').value,
        pic: document.getElementById('pic').value
    };

    const action = id ? 'update' : 'create';
    if (id) payload.id = id;

    try {
        const response = await fetch(`${SCRIPT_URL}?action=${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            Swal.fire({ title: 'Berhasil!', text: result.message, icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
            fetchData();
        } else {
            Swal.fire({ title: 'Gagal', text: result.message, icon: 'error', customClass: { popup: 'rounded-2xl' } });
        }
    } catch (error) {
        Swal.fire({ title: 'Error', text: 'Terjadi kesalahan jaringan.', icon: 'error', customClass: { popup: 'rounded-2xl' } });
        console.error(error);
    } finally {
        btnSubmit.innerHTML = '<i class="fa-solid fa-floppy-disk mr-2"></i> Simpan Transaksi';
        btnSubmit.disabled = false;
    }
}

// ==========================================
// FUNGSI DELETE (HAPUS DATA)
// ==========================================
function deleteData(id) {
    Swal.fire({
        title: 'Hapus Transaksi?',
        text: "Data akan dihapus permanen dari sistem.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        customClass: { popup: 'rounded-2xl' }
    }).then(async (result) => {
        if (result.isConfirmed) {
            Swal.fire({ title: 'Menghapus...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() }, customClass: { popup: 'rounded-2xl' } });
            
            try {
                const response = await fetch(`${SCRIPT_URL}?action=delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ id: id })
                });
                const res = await response.json();
                
                if (res.success) {
                    Swal.fire({ title: 'Terhapus!', text: res.message, icon: 'success', timer: 1500, showConfirmButton: false, customClass: { popup: 'rounded-2xl' } });
                    fetchData();
                } else {
                    Swal.fire({ title: 'Gagal', text: res.message, icon: 'error', customClass: { popup: 'rounded-2xl' } });
                }
            } catch (error) {
                Swal.fire({ title: 'Error', text: 'Terjadi kesalahan jaringan.', icon: 'error', customClass: { popup: 'rounded-2xl' } });
            }
        }
    })
}

// ==========================================
// FUNGSI PENCARIAN & FILTER RIWAYAT
// ==========================================
function filterHistory() {
    const keyword = document.getElementById('search-input').value.toLowerCase();
    const jenis = document.getElementById('filter-jenis').value;

    const filteredData = globalData.filter(item => {
        const matchKeyword = item.keterangan.toLowerCase().includes(keyword) || 
                             item.pic.toLowerCase().includes(keyword) ||
                             item.kategori.toLowerCase().includes(keyword);
        
        const matchJenis = jenis === 'Semua' || item.jenis === jenis;

        return matchKeyword && matchJenis;
    });

    renderHistory(filteredData);
}

// ==========================================
// REGISTRASI SERVICE WORKER (PWA)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker sukses didaftarkan dengan scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker gagal didaftarkan: ', err);
            });
    });
}

// Panggil data pertama kali saat web diload
window.onload = fetchData;