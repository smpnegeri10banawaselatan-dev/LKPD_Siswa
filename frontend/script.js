/****************************************************
 * script.js - Frontend Logic
 * Sistem Pembelajaran Digital - SMPN 10 Banawa Selatan
 ****************************************************/

const API_URL = "https://script.google.com/macros/s/AKfycbyS5NjyMy6VMcFQNpeQ1k0d6QUoQqvnXoFAmPqMuFdC_SjgfYYQfN3mQPOsz3m39IuoJg/exec"; 
// ⚠️ Ganti dengan URL Web App kamu setelah di-deploy dari Apps Script (Publish > Deploy as Web App)

/* =====================================================
   LOGIN HANDLER
===================================================== */
async function loginUser(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch(API_URL + "?action=login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();

    if (data.status === "success") {
      localStorage.setItem("user", JSON.stringify(data));
      window.location.href = "dashboard.html";
    } else {
      showToast("❌ " + data.message);
    }
  } catch (err) {
    showToast("⚠️ Gagal login, periksa koneksi atau server.");
  }
}

/* =====================================================
   DASHBOARD LOADER
===================================================== */
function loadDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("welcomeName").innerText = user.name;
  document.getElementById("userRole").innerText = user.role;
}

/* =====================================================
   ABSENSI
===================================================== */
async function submitAbsensi(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("user"));
  const tanggal = document.getElementById('tanggal').value;
  const status = document.getElementById('status').value;

  const payload = {
    nama: user.name,
    kelas: document.getElementById('kelas').value,
    peran: user.role,
    tanggal,
    status,
  };

  try {
    const res = await fetch(API_URL + "?action=absen", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    showToast("✅ " + data.message);
  } catch (err) {
    showToast("⚠️ Gagal menyimpan absensi.");
  }
}

/* =====================================================
   MATERI - TIMER & TANGGAPAN
===================================================== */
let timerInterval;
let seconds = 0;

function startTimer() {
  timerInterval = setInterval(() => {
    seconds++;
    document.getElementById("timer").innerText = formatTime(seconds);
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

async function kirimTanggapan() {
  const user = JSON.parse(localStorage.getItem("user"));
  const materi = document.getElementById('materi').value;
  const tanggapan = document.getElementById('tanggapan').value;
  const kelas = document.getElementById('kelas').value;
  const durasi = formatTime(seconds);

  try {
    const res = await fetch(API_URL + "?action=tanggapan", {
      method: "POST",
      body: JSON.stringify({ nama: user.name, kelas, materi, durasi, tanggapan }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    showToast("✅ " + data.message);
  } catch {
    showToast("⚠️ Gagal mengirim tanggapan.");
  }
}

/* =====================================================
   LKPD - UPLOAD FILE
===================================================== */
async function uploadLKPD(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("user"));
  const kelas = document.getElementById("kelas").value;
  const fileInput = document.getElementById("fileInput");

  if (fileInput.files.length === 0) {
    showToast("⚠️ Pilih file terlebih dahulu.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onloadend = async function () {
    const base64Data = reader.result.split(",")[1];
    const payload = {
      nama: user.name,
      kelas,
      fileName: file.name,
      base64Data,
    };

    try {
      const res = await fetch(API_URL + "?action=uploadLKPD", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      showToast("✅ " + data.message);
      if (data.url) {
        document.getElementById("uploadResult").innerHTML =
          `<a href="${data.url}" target="_blank" class="text-blue-600 underline">Lihat file LKPD</a>`;
      }
    } catch {
      showToast("⚠️ Gagal upload LKPD.");
    }
  };

  reader.readAsDataURL(file);
}

/* =====================================================
   UTILITIES
===================================================== */
function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.innerText = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3000);
}

