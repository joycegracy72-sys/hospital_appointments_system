import { api } from './api.js';

// Application State
let currentTab = 'dashboard';
let cachedDoctors = [];
let cachedPatients = [];
let cachedSpecializations = [];

// DOM References
const app = document.getElementById('app');
const modalContainer = document.getElementById('modal-container');
const toastContainer = document.getElementById('toast-container');

// Navigation Elements
const navBtns = {
  dashboard: document.getElementById('nav-dashboard'),
  appointments: document.getElementById('nav-appointments'),
  'smart-scheduling': document.getElementById('nav-smart-scheduling'),
  simulator: document.getElementById('nav-simulator'),
  queue: document.getElementById('nav-queue'),
  conflicts: document.getElementById('nav-conflicts'),
  patients: document.getElementById('nav-patients'),
  doctors: document.getElementById('nav-doctors'),
};

// Toast Notification Utility
export function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-sky-600 text-white',
    warn: 'bg-amber-600 text-white',
  };
  const icons = {
    success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
    error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
    info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    warn: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
  };

  toast.className = `${bgColors[type] || bgColors.info} p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0 text-sm font-medium z-50`;
  toast.innerHTML = `
    <span class="flex-shrink-0">${icons[type] || icons.info}</span>
    <span class="flex-1">${escapeHtml(message)}</span>
    <button class="text-white/80 hover:text-white ml-2" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4500);
}

// Modal Helpers
function openModal(contentHtml) {
  modalContainer.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-fade-in border border-slate-100">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      ${contentHtml}
    </div>
  `;
  modalContainer.classList.remove('hidden');
  document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
}

function closeModal() {
  modalContainer.classList.add('hidden');
  modalContainer.innerHTML = '';
}

modalContainer.addEventListener('click', (e) => {
  if (e.target === modalContainer) closeModal();
});

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatStatus(status) {
  const map = {
    SCHEDULED: { bg: 'bg-sky-50 text-sky-700 border-sky-200', label: 'Scheduled' },
    CHECKED_IN: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', label: 'Checked In' },
    COMPLETED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },
    RESCHEDULED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Rescheduled' },
    NO_SHOW: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'No Show' },
    WAITING: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Waiting' },
    OFFERED: { bg: 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse', label: 'Slot Offered' },
    ACCEPTED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Accepted' },
    EXPIRED: { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: 'Expired' },
  };
  const item = map[status] || { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: status };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg}">${item.label}</span>`;
}

function addMinutesToTime(timeStr, mins) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

// Tab Switching
function switchTab(tab) {
  currentTab = tab;
  Object.keys(navBtns).forEach((key) => {
    const btn = navBtns[key];
    if (!btn) return;
    if (key === tab) {
      btn.className = 'nav-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 text-sky-700 bg-sky-50 border border-sky-200/60 shadow-xs whitespace-nowrap';
    } else {
      btn.className = 'nav-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap';
    }
  });

  if (tab === 'dashboard') renderDashboard();
  else if (tab === 'appointments') renderAppointments();
  else if (tab === 'smart-scheduling') renderSmartScheduling();
  else if (tab === 'simulator') renderSimulator();
  else if (tab === 'queue') renderWaitlistAndQueue();
  else if (tab === 'conflicts') renderConflicts();
  else if (tab === 'patients') renderPatients();
  else if (tab === 'doctors') renderDoctors();
}

Object.keys(navBtns).forEach((key) => {
  if (navBtns[key]) {
    navBtns[key].addEventListener('click', () => switchTab(key));
  }
});

// Cache Refresh
async function refreshLookupCaches() {
  try {
    const [doctors, patients, specs] = await Promise.all([
      api.getDoctors('', '', false),
      api.getPatients('', false),
      api.getSpecializations(),
    ]);
    cachedDoctors = doctors || [];
    cachedPatients = patients || [];
    cachedSpecializations = specs || [];
  } catch (err) {
    console.warn('Could not refresh lookups:', err);
  }
}

// ===================================================================
// 1. DASHBOARD VIEW
// ===================================================================
async function renderDashboard() {
  app.innerHTML = `
    <div class="flex items-center justify-center py-16">
      <div class="inline-flex items-center gap-3 text-slate-500 font-medium text-sm">
        <svg class="animate-spin h-5 w-5 text-sky-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Loading live dashboard statistics...
      </div>
    </div>
  `;

  try {
    const stats = await api.getDashboardStats();
    await refreshLookupCaches();

    app.innerHTML = `
      <div class="space-y-6">
        
        <!-- Welcome Banner & Quick Action Buttons -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Hospital Overview Dashboard</h2>
            <p class="text-sm text-slate-500 mt-0.5">Real-time statistics & appointment schedules powered by MySQL and Spring JdbcTemplate</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="quick-smart-btn" class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Smart Recommend
            </button>
            <button id="quick-book-btn" class="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Book 20-Min Slot
            </button>
            <button id="quick-patient-btn" class="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium rounded-xl text-sm shadow-xs transition flex items-center gap-1.5">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              New Patient
            </button>
          </div>
        </div>

        <!-- KPI Summary Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Total Patients -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Patients</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${stats.totalPatients}</h3>
            </div>
          </div>

          <!-- Total Doctors -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Doctors on Duty</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${stats.totalDoctors}</h3>
            </div>
          </div>

          <!-- Today's Consultations -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Visits</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${stats.todayAppointmentsCount}</h3>
            </div>
          </div>

          <!-- Scheduled Appointments -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Scheduled</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${stats.upcomingAppointmentsCount}</h3>
            </div>
          </div>

        </div>

        <!-- Upcoming Appointments Section -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div class="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 class="text-base font-bold text-slate-900">Upcoming Appointments (Fixed 20-Min Duration)</h3>
              <p class="text-xs text-slate-500 mt-0.5">Upcoming scheduled consultations with patient check-in</p>
            </div>
            <button onclick="window.switchTab('appointments')" class="text-xs font-semibold text-sky-600 hover:text-sky-800 transition">
              View All Appointments &rarr;
            </button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-sm">
              <thead>
                <tr class="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th class="py-3 px-4">Date & Time</th>
                  <th class="py-3 px-4">Patient</th>
                  <th class="py-3 px-4">Doctor</th>
                  <th class="py-3 px-4">Specialization</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${(stats.upcomingAppointments && stats.upcomingAppointments.length > 0) ? stats.upcomingAppointments.map((appt) => `
                  <tr class="hover:bg-slate-50/50 transition">
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="font-medium text-slate-900">${appt.appointmentDate}</span>
                      <span class="text-xs text-slate-500 block">${appt.startTime?.substring(0,5)} - ${appt.endTime?.substring(0,5)} (20m)</span>
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-900">${escapeHtml(appt.patientName)}</td>
                    <td class="py-3.5 px-4 text-slate-700">${escapeHtml(appt.doctorName)}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">${escapeHtml(appt.doctorSpecialization)}</span>
                    </td>
                    <td class="py-3.5 px-4">${formatStatus(appt.status)}</td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      ${(appt.status === 'SCHEDULED' || appt.status === 'RESCHEDULED') ? `
                        <button onclick="window.handleCheckIn(${appt.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Check In</button>
                      ` : ''}
                      <button onclick="window.handleRescheduleModal(${appt.appointmentId}, '${appt.appointmentDate}', '${appt.startTime}', '${appt.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                      <button onclick="window.handleCancelModal(${appt.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" class="text-center py-10 text-slate-400 font-medium text-sm">
                      No upcoming appointments found. Click "Book 20-Min Slot" above to create one.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    document.getElementById('quick-smart-btn')?.addEventListener('click', () => switchTab('smart-scheduling'));
    document.getElementById('quick-book-btn')?.addEventListener('click', () => openBookAppointmentModal());
    document.getElementById('quick-patient-btn')?.addEventListener('click', () => openPatientModal());

  } catch (error) {
    app.innerHTML = `
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 class="text-base font-bold text-rose-900">Failed to connect to Spring Boot backend</h3>
        <p class="text-xs text-rose-700 mt-1">${escapeHtml(error.message)}</p>
        <button onclick="window.renderDashboard()" class="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition">
          Retry Connection
        </button>
      </div>
    `;
  }
}

// ===================================================================
// 2. PATIENTS VIEW
// ===================================================================
async function renderPatients(search = '', activeOnly = false) {
  app.innerHTML = `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Patient Directory</h2>
          <p class="text-sm text-slate-500 mt-0.5">Manage patient demographics, registrations, and medical profiles</p>
        </div>
        <button id="add-patient-btn" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Register Patient
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" id="patient-search-input" value="${escapeHtml(search)}" placeholder="Search by patient name, email, or phone number..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer self-center px-1">
          <input type="checkbox" id="patient-active-only" ${activeOnly ? 'checked' : ''} class="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
          Active Only
        </label>
      </div>

      <!-- Patients Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div id="patients-table-container" class="overflow-x-auto">
          <div class="p-8 text-center text-slate-400">Loading patients...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('add-patient-btn').addEventListener('click', () => openPatientModal());
  
  const searchInput = document.getElementById('patient-search-input');
  const activeCheckbox = document.getElementById('patient-active-only');

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadPatientsTable(e.target.value, activeCheckbox.checked);
    }, 300);
  });

  activeCheckbox.addEventListener('change', () => {
    loadPatientsTable(searchInput.value, activeCheckbox.checked);
  });

  loadPatientsTable(search, activeOnly);
}

async function loadPatientsTable(search, activeOnly) {
  const container = document.getElementById('patients-table-container');
  if (!container) return;

  try {
    const patients = await api.getPatients(search, activeOnly);
    cachedPatients = patients;

    if (!patients || patients.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center">
          <p class="text-slate-500 font-medium text-sm">No patients found matching your search criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th class="py-3 px-4">ID</th>
            <th class="py-3 px-4">Patient Name</th>
            <th class="py-3 px-4">Contact</th>
            <th class="py-3 px-4">DOB / Gender</th>
            <th class="py-3 px-4">Blood Group</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${patients.map((p) => `
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${p.patientId}</td>
              <td class="py-3 px-4">
                <span class="font-semibold text-slate-900 block">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</span>
                <span class="text-xs text-slate-500">${escapeHtml(p.address || 'Address not specified')}</span>
              </td>
              <td class="py-3 px-4 text-xs">
                <div class="font-medium text-slate-800">${escapeHtml(p.phone)}</div>
                <div class="text-slate-500">${escapeHtml(p.email)}</div>
              </td>
              <td class="py-3 px-4 text-xs text-slate-700">
                <div>${p.dateOfBirth}</div>
                <div class="text-slate-500 font-medium">${p.gender}</div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-xs font-bold ${p.bloodGroup ? 'bg-rose-50 text-rose-700 border border-rose-200/80' : 'text-slate-400'}">
                  ${p.bloodGroup || 'N/A'}
                </span>
              </td>
              <td class="py-3 px-4">
                ${p.active ? `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>` : `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Deactivated</span>`}
              </td>
              <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                <button onclick="window.handleEditPatient(${p.patientId})" class="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Edit</button>
                ${p.active ? `<button onclick="window.handleDeactivatePatient(${p.patientId}, '${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}')" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Deactivate</button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-center text-rose-600 text-sm">Failed to load patients: ${escapeHtml(err.message)}</div>`;
  }
}

function openPatientModal(patient = null) {
  const isEdit = Boolean(patient);
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">${isEdit ? 'Update Patient Details' : 'Register New Patient'}</h3>
    <p class="text-xs text-slate-500 mb-4">Fill in the patient's personal and contact information below.</p>
    
    <form id="patient-form" class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
          <input type="text" name="firstName" required value="${escapeHtml(patient?.firstName || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Arun" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
          <input type="text" name="lastName" required value="${escapeHtml(patient?.lastName || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Kumar" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" name="email" required value="${escapeHtml(patient?.email || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="arun@example.com" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" name="phone" required value="${escapeHtml(patient?.phone || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="+91 9876543210" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
          <input type="date" name="dateOfBirth" required value="${patient?.dateOfBirth || '2000-01-01'}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
          <select name="gender" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="MALE" ${patient?.gender === 'MALE' ? 'selected' : ''}>Male</option>
            <option value="FEMALE" ${patient?.gender === 'FEMALE' ? 'selected' : ''}>Female</option>
            <option value="OTHER" ${patient?.gender === 'OTHER' ? 'selected' : ''}>Other</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
          <select name="bloodGroup" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="">Unknown</option>
            ${['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => `<option value="${bg}" ${patient?.bloodGroup === bg ? 'selected' : ''}>${bg}</option>`).join('')}
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
        <textarea name="address" rows="2" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="Street, City, Postal Code">${escapeHtml(patient?.address || '')}</textarea>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          ${isEdit ? 'Save Changes' : 'Register Patient'}
        </button>
      </div>
    </form>
  `);

  document.getElementById('patient-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isEdit) {
        await api.updatePatient(patient.patientId, data);
        showToast('Patient updated successfully');
      } else {
        await api.createPatient(data);
        showToast('Patient registered successfully');
      }
      closeModal();
      renderPatients();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ===================================================================
// 3. DOCTORS VIEW
// ===================================================================
async function renderDoctors(search = '', specialization = '') {
  app.innerHTML = `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Medical Specialists & Doctors</h2>
          <p class="text-sm text-slate-500 mt-0.5">Manage doctor profiles, specializations, consultation fees, working hours, and protected rest periods</p>
        </div>
        <button id="add-doctor-btn" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Add Doctor
        </button>
      </div>

      <!-- Filters -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div class="relative flex-1">
          <svg class="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" id="doctor-search-input" value="${escapeHtml(search)}" placeholder="Search doctor by name or email..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div class="sm:w-64">
          <select id="doctor-spec-filter" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="">All Specializations</option>
            ${cachedSpecializations.map(s => `<option value="${escapeHtml(s)}" ${specialization === s ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Doctors Grid -->
      <div id="doctors-grid-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full p-8 text-center text-slate-400">Loading doctors...</div>
      </div>
    </div>
  `;

  document.getElementById('add-doctor-btn').addEventListener('click', () => openDoctorModal());
  
  const searchInput = document.getElementById('doctor-search-input');
  const specSelect = document.getElementById('doctor-spec-filter');

  let debounceTimer;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      loadDoctorsGrid(e.target.value, specSelect.value);
    }, 300);
  });

  specSelect.addEventListener('change', (e) => {
    loadDoctorsGrid(searchInput.value, e.target.value);
  });

  loadDoctorsGrid(search, specialization);
}

async function loadDoctorsGrid(search, specialization) {
  const container = document.getElementById('doctors-grid-container');
  if (!container) return;

  try {
    const doctors = await api.getDoctors(search, specialization);
    cachedDoctors = doctors;

    if (!doctors || doctors.length === 0) {
      container.innerHTML = `<div class="col-span-full p-12 text-center text-slate-400 font-medium">No doctors found matching your filter criteria.</div>`;
      return;
    }

    container.innerHTML = doctors.map(doc => `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                ${escapeHtml(doc.specialization)}
              </span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Dr. ${escapeHtml(doc.firstName)} ${escapeHtml(doc.lastName)}</h3>
            </div>
            <span class="text-xs font-mono text-slate-400">#${doc.doctorId}</span>
          </div>

          <div class="mt-3 space-y-1 text-xs text-slate-600">
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              ${escapeHtml(doc.email)}
            </p>
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              ${escapeHtml(doc.phone)}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Consultation</span>
            <span class="font-bold text-slate-900 text-sm">₹${Number(doc.consultationFee).toFixed(2)}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="window.handleViewTimeline(${doc.doctorId}, 'Dr. ${escapeHtml(doc.firstName)} ${escapeHtml(doc.lastName)}')" class="px-2 py-1 font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition" title="View 20-min slot timeline">
              Timeline
            </button>
            <button onclick="window.handleManageRestPeriods(${doc.doctorId}, 'Dr. ${escapeHtml(doc.firstName)} ${escapeHtml(doc.lastName)}')" class="px-2 py-1 font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition" title="Protected rest periods">
              Rest Breaks
            </button>
            <button onclick="window.handleManageAvailability(${doc.doctorId}, 'Dr. ${escapeHtml(doc.firstName)} ${escapeHtml(doc.lastName)}')" class="px-2 py-1 font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">
              Shifts
            </button>
            <button onclick="window.handleEditDoctor(${doc.doctorId})" class="px-2 py-1 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = `<div class="col-span-full p-6 text-center text-rose-600 text-sm">Failed to load doctors: ${escapeHtml(err.message)}</div>`;
  }
}

function openDoctorModal(doctor = null) {
  const isEdit = Boolean(doctor);
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">${isEdit ? 'Update Doctor Details' : 'Add New Medical Specialist'}</h3>
    <p class="text-xs text-slate-500 mb-4">Enter doctor profile, specialization, and fee.</p>

    <form id="doctor-form" class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
          <input type="text" name="firstName" required value="${escapeHtml(doctor?.firstName || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Meena" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
          <input type="text" name="lastName" required value="${escapeHtml(doctor?.lastName || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Raj" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
          <input type="text" name="specialization" required value="${escapeHtml(doctor?.specialization || '')}" list="spec-suggestions" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Cardiology" />
          <datalist id="spec-suggestions">
            ${cachedSpecializations.map(s => `<option value="${escapeHtml(s)}"></option>`).join('')}
          </datalist>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹) *</label>
          <input type="number" step="10" name="consultationFee" required value="${doctor?.consultationFee || '500'}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" name="email" required value="${escapeHtml(doctor?.email || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="meena@hospital.org" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" name="phone" required value="${escapeHtml(doctor?.phone || '')}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="+91 9876500001" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          ${isEdit ? 'Save Changes' : 'Add Doctor'}
        </button>
      </div>
    </form>
  `);

  document.getElementById('doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      if (isEdit) {
        await api.updateDoctor(doctor.doctorId, data);
        showToast('Doctor profile updated successfully');
      } else {
        await api.createDoctor(data);
        showToast('Doctor registered successfully');
      }
      closeModal();
      await refreshLookupCaches();
      renderDoctors();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Manage Doctor Availability
async function openDoctorAvailabilityModal(doctorId, doctorName) {
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Manage Shift Availability — ${escapeHtml(doctorName)}</h3>
    <p class="text-xs text-slate-500 mb-4">Add or view working shift hours for this doctor.</p>

    <!-- Add Availability Slot Form -->
    <form id="add-availability-form" class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 mb-4">
      <h4 class="text-xs font-bold uppercase text-slate-700 tracking-wider">Add Scheduled Shift</h4>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">Date *</label>
          <input type="date" name="availableDate" required value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">Start Time *</label>
          <input type="time" name="startTime" required value="09:00" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">End Time *</label>
          <input type="time" name="endTime" required value="17:00" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
          + Add Shift
        </button>
      </div>
    </form>

    <!-- Slot list -->
    <div id="availability-slots-list" class="space-y-2 max-h-56 overflow-y-auto">
      <p class="text-xs text-slate-400 text-center py-4">Loading shifts...</p>
    </div>
  `);

  const refreshSlots = async () => {
    const list = document.getElementById('availability-slots-list');
    if (!list) return;

    try {
      const slots = await api.getDoctorAvailability(doctorId);
      if (!slots || slots.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No scheduled availability configured for this doctor (standard 09:00 - 17:00 outpatient hours apply).</p>`;
        return;
      }

      list.innerHTML = slots.map(s => `
        <div class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs">
          <div>
            <span class="font-bold text-slate-800">${s.availableDate}</span>
            <span class="text-slate-500 ml-2 font-mono">${s.startTime?.substring(0,5)} - ${s.endTime?.substring(0,5)}</span>
          </div>
          <button onclick="window.handleDeleteAvailability(${s.availabilityId}, ${doctorId}, '${escapeHtml(doctorName)}')" class="text-rose-600 hover:text-rose-800 font-medium">
            Delete
          </button>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = `<p class="text-xs text-rose-600 text-center py-2">${escapeHtml(err.message)}</p>`;
    }
  };

  document.getElementById('add-availability-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      doctorId,
      availableDate: formData.get('availableDate'),
      startTime: formData.get('startTime') + ':00',
      endTime: formData.get('endTime') + ':00',
    };

    try {
      await api.addDoctorAvailability(doctorId, data);
      showToast('Availability shift added');
      refreshSlots();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  refreshSlots();
}

// Manage Doctor Protected Rest Periods
async function openDoctorRestPeriodsModal(doctorId, doctorName) {
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Protected Rest Periods — ${escapeHtml(doctorName)}</h3>
    <p class="text-xs text-slate-500 mb-4">Protected rest periods are non-bypassable breaks (rounds, meetings, lunch) enforced strictly by the backend.</p>

    <form id="add-rest-period-form" class="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-3 mb-4">
      <h4 class="text-xs font-bold uppercase text-amber-800 tracking-wider">Configure Rest Break</h4>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">Date *</label>
          <input type="date" name="restDate" required value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">Start Time *</label>
          <input type="time" name="startTime" required value="13:00" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
        </div>
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">End Time *</label>
          <input type="time" name="endTime" required value="14:00" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
        </div>
      </div>
      <div>
        <label class="block text-[10px] font-semibold text-slate-600 mb-1">Reason / Description</label>
        <input type="text" name="reason" placeholder="e.g. ICU Rounds, Department Review, Lunch Break" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
      </div>
      <div class="flex justify-end">
        <button type="submit" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
          + Protect Rest Window
        </button>
      </div>
    </form>

    <div id="rest-periods-list" class="space-y-2 max-h-56 overflow-y-auto">
      <p class="text-xs text-slate-400 text-center py-4">Loading protected rest periods...</p>
    </div>
  `);

  const refreshRestPeriods = async () => {
    const list = document.getElementById('rest-periods-list');
    if (!list) return;

    try {
      const periods = await api.getDoctorRestPeriods(doctorId);
      if (!periods || periods.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No custom rest periods configured. Default hospital lunch window (13:00 - 14:00) is automatically guarded.</p>`;
        return;
      }

      list.innerHTML = periods.map(r => `
        <div class="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 text-xs">
          <div>
            <div class="font-bold text-slate-800 flex items-center gap-2">
              <span>${r.restDate}</span>
              <span class="font-mono text-amber-800">${r.startTime?.substring(0,5)} - ${r.endTime?.substring(0,5)}</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">${escapeHtml(r.reason)}</p>
          </div>
          <button onclick="window.handleDeleteRestPeriod(${r.restId}, ${doctorId}, '${escapeHtml(doctorName)}')" class="text-rose-600 hover:text-rose-800 font-medium">
            Remove
          </button>
        </div>
      `).join('');
    } catch (err) {
      list.innerHTML = `<p class="text-xs text-rose-600 text-center py-2">${escapeHtml(err.message)}</p>`;
    }
  };

  document.getElementById('add-rest-period-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      doctorId,
      restDate: formData.get('restDate'),
      startTime: formData.get('startTime') + ':00',
      endTime: formData.get('endTime') + ':00',
      reason: formData.get('reason'),
    };

    try {
      await api.addDoctorRestPeriod(doctorId, data);
      showToast('Protected rest period created');
      refreshRestPeriods();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  refreshRestPeriods();
}

// 20-Minute Schedule Timeline Visualizer
async function openDoctorTimelineModal(doctorId, doctorName) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Schedule Timeline — ${escapeHtml(doctorName)}</h3>
    <p class="text-xs text-slate-500 mb-4">Fixed 20-minute slot visualization showing bookings, rest intervals, and available slots.</p>

    <div class="flex items-center gap-3 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
      <label class="text-xs font-semibold text-slate-700">Select Date:</label>
      <input type="date" id="timeline-date-picker" value="${tomorrow}" class="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
      <button id="refresh-timeline-btn" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition">
        Load Timeline
      </button>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-3 text-xs mb-3 flex-wrap">
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-emerald-500"></span> Available (20m)</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-sky-600"></span> Booked</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-amber-500"></span> Protected Rest</span>
      <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-slate-300"></span> Off Duty</span>
    </div>

    <!-- Timeline Grid Container -->
    <div id="timeline-slots-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto p-1">
      <p class="col-span-full text-center text-xs text-slate-400 py-6">Loading schedule slots...</p>
    </div>
  `);

  const loadTimeline = async (date) => {
    const grid = document.getElementById('timeline-slots-grid');
    if (!grid) return;

    try {
      const timeline = await api.getDoctorTimeline(doctorId, date);
      if (!timeline || !timeline.slots || timeline.slots.length === 0) {
        grid.innerHTML = `<p class="col-span-full text-center text-xs text-slate-400 py-6">No slot data available for ${date}.</p>`;
        return;
      }

      grid.innerHTML = timeline.slots.map(s => {
        let bg = 'bg-slate-100 text-slate-500 border-slate-200';
        let badgeText = s.label;
        if (s.slotType === 'AVAILABLE') {
          bg = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer';
        } else if (s.slotType === 'BOOKED') {
          bg = 'bg-sky-50 text-sky-800 border-sky-200';
        } else if (s.slotType === 'REST_PERIOD') {
          bg = 'bg-amber-50 text-amber-800 border-amber-200';
        }

        return `
          <div class="p-2 rounded-lg border text-xs flex flex-col justify-between ${bg} transition" title="${escapeHtml(s.reason || s.label)}">
            <span class="font-mono font-bold">${s.startTime?.substring(0,5)} - ${s.endTime?.substring(0,5)}</span>
            <span class="text-[10px] mt-1 truncate">${escapeHtml(badgeText)}</span>
          </div>
        `;
      }).join('');
    } catch (err) {
      grid.innerHTML = `<p class="col-span-full text-center text-xs text-rose-600 py-4">${escapeHtml(err.message)}</p>`;
    }
  };

  document.getElementById('refresh-timeline-btn')?.addEventListener('click', () => {
    const d = document.getElementById('timeline-date-picker').value;
    loadTimeline(d);
  });

  loadTimeline(tomorrow);
}

// ===================================================================
// 4. APPOINTMENTS VIEW
// ===================================================================
async function renderAppointments(filters = {}) {
  await refreshLookupCaches();

  app.innerHTML = `
    <div class="space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-900">Appointments Schedule</h2>
          <p class="text-sm text-slate-500 mt-0.5">Fixed 20-minute slots, protected rest periods, and live patient check-in</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="window.switchTab('smart-scheduling')" class="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Smart Recommend
          </button>
          <button id="book-appt-btn" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Book 20-Min Slot
          </button>
        </div>
      </div>

      <!-- Filter Controls -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Date</label>
          <input type="date" id="appt-date-filter" value="${filters.date || ''}" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Doctor</label>
          <select id="appt-doctor-filter" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
            <option value="">All Doctors</option>
            ${cachedDoctors.map(d => `<option value="${d.doctorId}" ${filters.doctorId == d.doctorId ? 'selected' : ''}>Dr. ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)} (${escapeHtml(d.specialization)})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Status</label>
          <select id="appt-status-filter" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
            <option value="">All Statuses</option>
            <option value="SCHEDULED" ${filters.status === 'SCHEDULED' ? 'selected' : ''}>Scheduled</option>
            <option value="CHECKED_IN" ${filters.status === 'CHECKED_IN' ? 'selected' : ''}>Checked In</option>
            <option value="COMPLETED" ${filters.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            <option value="RESCHEDULED" ${filters.status === 'RESCHEDULED' ? 'selected' : ''}>Rescheduled</option>
            <option value="CANCELLED" ${filters.status === 'CANCELLED' ? 'selected' : ''}>Cancelled</option>
            <option value="NO_SHOW" ${filters.status === 'NO_SHOW' ? 'selected' : ''}>No Show</option>
          </select>
        </div>
      </div>

      <!-- Appointments Table -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div id="appointments-table-container" class="overflow-x-auto">
          <div class="p-8 text-center text-slate-400">Loading appointments...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('book-appt-btn').addEventListener('click', () => openBookAppointmentModal());

  const dateFilter = document.getElementById('appt-date-filter');
  const docFilter = document.getElementById('appt-doctor-filter');
  const statusFilter = document.getElementById('appt-status-filter');

  const onFilterChange = () => {
    loadAppointmentsTable({
      date: dateFilter.value,
      doctorId: docFilter.value,
      status: statusFilter.value,
    });
  };

  dateFilter.addEventListener('change', onFilterChange);
  docFilter.addEventListener('change', onFilterChange);
  statusFilter.addEventListener('change', onFilterChange);

  loadAppointmentsTable(filters);
}

async function loadAppointmentsTable(filters) {
  const container = document.getElementById('appointments-table-container');
  if (!container) return;

  try {
    const appts = await api.getAppointments(filters);

    if (!appts || appts.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center">
          <p class="text-slate-500 font-medium text-sm">No appointments found matching your criteria.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th class="py-3 px-4">ID</th>
            <th class="py-3 px-4">Date & Time</th>
            <th class="py-3 px-4">Patient</th>
            <th class="py-3 px-4">Doctor</th>
            <th class="py-3 px-4">Reason / Notes</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${appts.map((a) => `
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${a.appointmentId}</td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="font-semibold text-slate-900 block">${a.appointmentDate}</span>
                <span class="text-xs font-mono text-slate-500">${a.startTime?.substring(0,5)} - ${a.endTime?.substring(0,5)} (20m)</span>
                ${a.checkInTime ? `<span class="text-[10px] text-indigo-600 font-medium block">Checked-In @ ${a.checkInTime.split('T')[1]?.substring(0,5)}</span>` : ''}
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-slate-900 block">${escapeHtml(a.patientName)}</span>
                <span class="text-xs text-slate-500">${escapeHtml(a.patientPhone)}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-slate-900 block">${escapeHtml(a.doctorName)}</span>
                <span class="text-xs text-sky-600 font-medium">${escapeHtml(a.doctorSpecialization)}</span>
              </td>
              <td class="py-3 px-4 max-w-xs text-xs">
                <p class="text-slate-800 font-medium truncate">${escapeHtml(a.reasonForVisit || 'General Visit')}</p>
                ${a.notes ? `<p class="text-slate-500 truncate mt-0.5">Note: ${escapeHtml(a.notes)}</p>` : ''}
                ${a.cancellationReason ? `<p class="text-rose-600 font-medium truncate mt-0.5">Cancelled: ${escapeHtml(a.cancellationReason)}</p>` : ''}
              </td>
              <td class="py-3 px-4">${formatStatus(a.status)}</td>
              <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                ${(a.status === 'SCHEDULED' || a.status === 'RESCHEDULED') ? `
                  <button onclick="window.handleCheckIn(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">Check In</button>
                  <button onclick="window.handleStatusUpdate(${a.appointmentId}, 'COMPLETED')" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Complete</button>
                  <button onclick="window.handleRescheduleModal(${a.appointmentId}, '${a.appointmentDate}', '${a.startTime}', '${a.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                  <button onclick="window.handleCancelModal(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                ` : (a.status === 'CHECKED_IN') ? `
                  <button onclick="window.handleStatusUpdate(${a.appointmentId}, 'COMPLETED')" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Complete Visit</button>
                  <button onclick="window.handleCancelModal(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                ` : `
                  <span class="text-xs text-slate-400 italic">Historical</span>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-center text-rose-600 text-sm">Failed to load appointments: ${escapeHtml(err.message)}</div>`;
  }
}

function openBookAppointmentModal() {
  const activePatients = cachedPatients.filter(p => p.active);
  const activeDoctors = cachedDoctors.filter(d => d.active);

  if (activePatients.length === 0) {
    showToast('Please register at least one active patient first.', 'info');
    openPatientModal();
    return;
  }

  if (activeDoctors.length === 0) {
    showToast('Please register at least one active doctor first.', 'info');
    openDoctorModal();
    return;
  }

  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Book 20-Minute Appointment</h3>
    <p class="text-xs text-slate-500 mb-3">Enforces fixed 20-minute slot duration, protected rest breaks, and concurrency protection.</p>

    <div class="bg-sky-50 border border-sky-200/80 rounded-xl p-3 mb-3 flex items-center justify-between text-xs text-sky-800">
      <span>Duration: <strong>20 Minutes</strong> (End time computed automatically)</span>
      <button type="button" onclick="window.closeModal(); window.switchTab('smart-scheduling')" class="text-sky-700 underline font-semibold hover:text-sky-900">
        Try Smart Recommendation &rarr;
      </button>
    </div>

    <form id="book-appt-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
        <select name="patientId" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
          ${activePatients.map(p => `<option value="${p.patientId}">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)} (${escapeHtml(p.phone)})</option>`).join('')}
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Doctor *</label>
        <select name="doctorId" id="book-doctor-select" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
          ${activeDoctors.map(d => `<option value="${d.doctorId}">Dr. ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)} — ${escapeHtml(d.specialization)} (₹${d.consultationFee})</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
          <input type="date" name="appointmentDate" required value="${tomorrow}" min="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
          <input type="time" name="startTime" id="book-start-time" required value="09:00" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">End Time (Auto 20m) *</label>
          <input type="time" name="endTime" id="book-end-time" readonly required value="09:20" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit</label>
        <input type="text" name="reasonForVisit" placeholder="e.g. Regular health checkup or chest discomfort" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
        <textarea name="notes" rows="2" placeholder="Optional notes for physician..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          Confirm 20-Min Booking
        </button>
      </div>
    </form>
  `);

  const startInput = document.getElementById('book-start-time');
  const endInput = document.getElementById('book-end-time');
  startInput.addEventListener('input', () => {
    endInput.value = addMinutesToTime(startInput.value, 20);
  });

  document.getElementById('book-appt-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      patientId: Number(formData.get('patientId')),
      doctorId: Number(formData.get('doctorId')),
      appointmentDate: formData.get('appointmentDate'),
      startTime: formData.get('startTime') + ':00',
      endTime: formData.get('endTime') + ':00',
      reasonForVisit: formData.get('reasonForVisit'),
      notes: formData.get('notes'),
    };

    try {
      await api.bookAppointment(data);
      showToast('20-Minute appointment booked successfully!');
      closeModal();
      if (currentTab === 'dashboard') renderDashboard();
      else renderAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// ===================================================================
// 5. FEATURE 1 & 3 & 5: SMART SCHEDULING & WORKLOAD BALANCING
// ===================================================================
async function renderSmartScheduling() {
  await refreshLookupCaches();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  app.innerHTML = `
    <div class="space-y-6">
      <div class="pb-2 border-b border-slate-200">
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </span>
          Intelligent Recommendation & Workload Balancing Engine
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          Deterministic 20-minute slot ranking with explainable decisions, doctor workload balancing, and rest break protection.
        </p>
      </div>

      <!-- Controls Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div class="flex items-center gap-4 mb-4 border-b border-slate-100 pb-3">
          <label class="text-xs font-bold uppercase text-slate-500 tracking-wider">Engine Mode:</label>
          <div class="flex items-center gap-4 text-xs font-semibold">
            <label class="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="recommendMode" value="doctor" checked class="text-amber-600 focus:ring-amber-500" />
              Specific Doctor Preference
            </label>
            <label class="inline-flex items-center gap-1.5 cursor-pointer">
              <input type="radio" name="recommendMode" value="workload" class="text-amber-600 focus:ring-amber-500" />
              Specialization Workload-Balanced (Auto-Pick Least-Loaded Doctor)
            </label>
          </div>
        </div>

        <form id="recommend-form" class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Patient *</label>
            <select name="patientId" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
              ${cachedPatients.filter(p => p.active).map(p => `<option value="${p.patientId}">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</option>`).join('')}
            </select>
          </div>

          <div id="doctor-picker-col">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Doctor *</label>
            <select name="doctorId" id="rec-doctor-select" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
              ${cachedDoctors.filter(d => d.active).map(d => `<option value="${d.doctorId}">Dr. ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)} (${escapeHtml(d.specialization)})</option>`).join('')}
            </select>
          </div>

          <div id="spec-picker-col" class="hidden">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
            <select name="specialization" id="rec-spec-select" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
              ${cachedSpecializations.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <input type="date" name="date" required value="${tomorrow}" min="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Preferred Time (Optional)</label>
            <input type="time" name="preferredStartTime" placeholder="Optional" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
          </div>

          <div class="sm:col-span-4 flex justify-end pt-2">
            <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Find Optimal 20-Min Slot
            </button>
          </div>
        </form>
      </div>

      <!-- Result Container -->
      <div id="recommendation-result" class="hidden animate-fade-in">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const modeRadios = document.querySelectorAll('input[name="recommendMode"]');
  const docCol = document.getElementById('doctor-picker-col');
  const specCol = document.getElementById('spec-picker-col');

  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'workload') {
        docCol.classList.add('hidden');
        specCol.classList.remove('hidden');
      } else {
        docCol.classList.remove('hidden');
        specCol.classList.add('hidden');
      }
    });
  });

  document.getElementById('recommend-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const mode = document.querySelector('input[name="recommendMode"]:checked').value;
    const patientId = Number(formData.get('patientId'));
    const date = formData.get('date');
    const prefTime = formData.get('preferredStartTime') ? formData.get('preferredStartTime') + ':00' : null;

    const resContainer = document.getElementById('recommendation-result');
    resContainer.classList.remove('hidden');
    resContainer.innerHTML = `<div class="p-8 text-center text-slate-400">Evaluating slots and workload metrics...</div>`;

    try {
      let rec;
      if (mode === 'workload') {
        const spec = formData.get('specialization');
        rec = await api.recommendWorkloadBalancedSlot(spec, patientId, date, prefTime);
      } else {
        const docId = Number(formData.get('doctorId'));
        rec = await api.recommendSlot(docId, patientId, date, prefTime);
      }

      if (!rec || !rec.recommendedStart) {
        resContainer.innerHTML = `
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <h3 class="text-base font-bold text-amber-900">No Suitable 20-Minute Slot Found</h3>
            <p class="text-xs text-amber-800 mt-1">${escapeHtml(rec?.explanation || 'All candidate slots are either fully booked or inside protected rest periods.')}</p>
            ${rec && rec.rejectedReasons && rec.rejectedReasons.length > 0 ? `
              <div class="mt-4 text-left max-w-md mx-auto bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700">
                <span class="font-bold block mb-1">Audit of Rejection Reasons:</span>
                <ul class="list-disc pl-4 space-y-0.5">
                  ${rec.rejectedReasons.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        `;
        return;
      }

      resContainer.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Optimal 20-Min Slot Identified
              </span>
              <h3 class="text-xl font-bold text-slate-900 mt-1">${escapeHtml(rec.doctorName)}</h3>
              <p class="text-xs text-slate-500">${escapeHtml(rec.specialization)} &bull; Date: ${rec.appointmentDate}</p>
            </div>
            <div class="text-right sm:text-right">
              <span class="text-xs text-slate-400 block uppercase font-bold">Recommended Slot</span>
              <span class="text-2xl font-black text-emerald-600 font-mono">${rec.recommendedStart?.substring(0,5)} - ${rec.recommendedEnd?.substring(0,5)}</span>
              <span class="text-[10px] text-slate-400 block">Duration: Exactly 20 Minutes</span>
            </div>
          </div>

          <!-- Doctor Workload Badge -->
          ${rec.workload ? `
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span class="font-bold text-slate-700 block">Doctor Workload Status</span>
                <span class="text-slate-500">${rec.workload.scheduledAppointmentsCount} appointment(s) scheduled (${rec.workload.scheduledMinutes} consultation minutes)</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${rec.workload.scheduledAppointmentsCount <= 2 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${rec.workload.scheduledAppointmentsCount <= 2 ? 'Light Load (Optimal)' : 'Moderate Load'}
              </span>
            </div>
          ` : ''}

          <!-- Explainable Decision -->
          <div class="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950">
            <span class="font-bold block mb-1 flex items-center gap-1.5 text-indigo-900">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Why This Slot Was Chosen (Explainable Engine Decision):
            </span>
            <p>${escapeHtml(rec.explanation)}</p>
          </div>

          <!-- Ranking Factors -->
          ${rec.rankingFactors && rec.rankingFactors.length > 0 ? `
            <div>
              <span class="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-2">Evaluated Ranking Factors:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                ${rec.rankingFactors.map(f => `
                  <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                    <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span>${escapeHtml(f)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Audit of Rejected Slots -->
          ${rec.rejectedReasons && rec.rejectedReasons.length > 0 ? `
            <details class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
              <summary class="font-bold text-slate-700">Audit of Inspected & Rejected Slots (${rec.rejectedReasons.length})</summary>
              <ul class="list-disc pl-5 mt-2 space-y-1 text-slate-500">
                ${rec.rejectedReasons.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
              </ul>
            </details>
          ` : ''}

          <!-- Alternative Slots -->
          ${rec.alternativeSlots && rec.alternativeSlots.length > 0 ? `
            <div>
              <span class="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-2">Alternative 20-Min Slots:</span>
              <div class="flex items-center gap-2 flex-wrap">
                ${rec.alternativeSlots.map(alt => `
                  <button type="button" onclick="window.quickBookSlot(${rec.doctorId}, ${rec.patientId}, '${rec.appointmentDate}', '${alt.startTime}', '${alt.endTime}')" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-medium text-slate-800 transition">
                    ${alt.startTime?.substring(0,5)} - ${alt.endTime?.substring(0,5)}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Action -->
          <div class="flex justify-end pt-3 border-t border-slate-100">
            <button id="confirm-rec-booking-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              Confirm & Book This Recommended Slot
            </button>
          </div>
        </div>
      `;

      document.getElementById('confirm-rec-booking-btn')?.addEventListener('click', async () => {
        try {
          await api.bookAppointment({
            patientId: rec.patientId,
            doctorId: rec.doctorId,
            appointmentDate: rec.appointmentDate,
            startTime: rec.recommendedStart + (rec.recommendedStart.length === 5 ? ':00' : ''),
            endTime: rec.recommendedEnd + (rec.recommendedEnd.length === 5 ? ':00' : ''),
            reasonForVisit: 'Booked via Intelligent Recommendation Engine',
            notes: 'Verified 20-min slot with rest protection and workload balancing.',
          });
          showToast('Recommended 20-minute appointment confirmed and booked!');
          switchTab('appointments');
        } catch (err) {
          showToast(err.message, 'error');
        }
      });

    } catch (err) {
      resContainer.innerHTML = `<div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-xs text-rose-700">${escapeHtml(err.message)}</div>`;
    }
  });
}

// Quick book helper for alternative slots
window.quickBookSlot = async (doctorId, patientId, date, start, end) => {
  try {
    await api.bookAppointment({
      doctorId,
      patientId,
      appointmentDate: date,
      startTime: start + (start.length === 5 ? ':00' : ''),
      endTime: end + (end.length === 5 ? ':00' : ''),
      reasonForVisit: 'Selected alternative slot from Recommendation Engine',
    });
    showToast('Alternative 20-minute appointment booked successfully!');
    switchTab('appointments');
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ===================================================================
// 6. FEATURE 2: DIGITAL TWIN / WHAT-IF SIMULATOR
// ===================================================================
async function renderSimulator() {
  await refreshLookupCaches();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  app.innerHTML = `
    <div class="space-y-6">
      <div class="pb-2 border-b border-slate-200">
        <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </span>
          Hospital Schedule Digital Twin / What-If Simulator
        </h2>
        <p class="text-sm text-slate-500 mt-1">
          In-memory simulation of doctor rest periods, shift alterations, and emergency insertions without mutating database state.
        </p>
      </div>

      <!-- Simulator Form Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <form id="simulator-form" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Doctor *</label>
              <select name="doctorId" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                ${cachedDoctors.filter(d => d.active).map(d => `<option value="${d.doctorId}">Dr. ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)} (${escapeHtml(d.specialization)})</option>`).join('')}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Simulation Date *</label>
              <input type="date" name="simulationDate" required value="${tomorrow}" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Scenario Type *</label>
              <select name="simulationType" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="ADD_EXTRA_REST_PERIOD">Add Extra Rest Break / Department Meeting</option>
                <option value="REDUCED_WORKING_HOURS">Simulate Reduced Shift Hours</option>
                <option value="INSERT_TEST_APPOINTMENT">Test Emergency / Priority Consultation Insertion</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Simulated Start Time *</label>
              <input type="time" name="startTime" required value="14:00" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Simulated End Time *</label>
              <input type="time" name="endTime" required value="15:00" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Description / Clinical Purpose</label>
              <input type="text" name="description" placeholder="e.g. Mandatory Hospital Clinical Review" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            </div>
          </div>

          <div class="flex justify-end pt-2 border-t border-slate-100">
            <button type="submit" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Run Digital Twin Simulation
            </button>
          </div>
        </form>
      </div>

      <!-- Simulation Output Container -->
      <div id="simulation-output" class="hidden animate-fade-in">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  document.getElementById('simulator-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      doctorId: Number(formData.get('doctorId')),
      simulationDate: formData.get('simulationDate'),
      simulationType: formData.get('simulationType'),
      startTime: formData.get('startTime') + ':00',
      endTime: formData.get('endTime') + ':00',
      description: formData.get('description') || 'Digital Twin Test Scenario',
    };

    const out = document.getElementById('simulation-output');
    out.classList.remove('hidden');
    out.innerHTML = `<div class="p-8 text-center text-slate-400">Simulating schedule alterations in-memory...</div>`;

    try {
      const sim = await api.previewSimulation(data);

      const riskBadges = {
        SAFE: { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', text: 'SAFE — Zero Appointment Conflicts' },
        CAUTION: { bg: 'bg-amber-100 text-amber-800 border-amber-300', text: 'CAUTION — Collides with Active Bookings' },
        HIGH_CONFLICT: { bg: 'bg-rose-100 text-rose-800 border-rose-300', text: 'HIGH CONFLICT — Severe Disruption' },
      };
      const risk = riskBadges[sim.riskLevel] || riskBadges.SAFE;

      out.innerHTML = `
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${risk.bg}">
                Risk Level: ${risk.text}
              </span>
              <h3 class="text-xl font-bold text-slate-900 mt-1">${escapeHtml(sim.scenarioDescription)}</h3>
              <p class="text-xs text-slate-500">${escapeHtml(sim.doctorName)} &bull; ${sim.simulationDate}</p>
            </div>
            <div class="flex items-center gap-4 text-center">
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Baseline Slots</span>
                <span class="text-lg font-bold text-slate-800">${sim.validSlotsBefore}</span>
              </div>
              <div class="text-slate-400 font-bold">&rarr;</div>
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Projected Slots</span>
                <span class="text-lg font-bold text-indigo-700">${sim.validSlotsAfter}</span>
              </div>
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Capacity Delta</span>
                <span class="text-lg font-bold ${sim.slotDelta < 0 ? 'text-rose-600' : 'text-emerald-600'}">${sim.slotDelta > 0 ? '+' : ''}${sim.slotDelta} slots</span>
              </div>
            </div>
          </div>

          <!-- Explanation -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span class="font-bold text-slate-900 block mb-1">Simulator Analysis Summary:</span>
            <p>${escapeHtml(sim.explanation)}</p>
          </div>

          <!-- Conflicted Appointments -->
          ${sim.conflictingAppointments && sim.conflictingAppointments.length > 0 ? `
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase text-rose-700 tracking-wider block">
                Impacted Active Appointments (${sim.conflictingAppointments.length}):
              </span>
              <div class="overflow-x-auto border border-rose-200 rounded-xl">
                <table class="w-full text-left text-xs">
                  <thead class="bg-rose-50 text-rose-900 font-semibold border-b border-rose-200">
                    <tr>
                      <th class="py-2 px-3">Appt ID</th>
                      <th class="py-2 px-3">Patient</th>
                      <th class="py-2 px-3">Scheduled Time</th>
                      <th class="py-2 px-3">Impact Explanation</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-rose-100 bg-white">
                    ${sim.conflictingAppointments.map(c => `
                      <tr>
                        <td class="py-2 px-3 font-mono">#${c.appointmentId}</td>
                        <td class="py-2 px-3 font-medium">${escapeHtml(c.patientName)}</td>
                        <td class="py-2 px-3 font-mono">${c.startTime?.substring(0,5)} - ${c.endTime?.substring(0,5)}</td>
                        <td class="py-2 px-3 text-rose-700 font-medium">${escapeHtml(c.impactReason)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : `
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Zero schedule collisions. The simulated change is entirely safe to introduce into the doctor's live schedule.</span>
            </div>
          `}

          <!-- Apply Button (Only if SAFE and ADD_EXTRA_REST_PERIOD) -->
          ${(sim.canApplySafely && data.simulationType === 'ADD_EXTRA_REST_PERIOD') ? `
            <div class="flex justify-end pt-3 border-t border-slate-100">
              <button id="apply-sim-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Apply Rest Period to Doctor Schedule
              </button>
            </div>
          ` : ''}
        </div>
      `;

      document.getElementById('apply-sim-btn')?.addEventListener('click', async () => {
        try {
          await api.applySimulation(data);
          showToast('Simulated rest break applied to doctor schedule successfully!');
          renderSimulator();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });

    } catch (err) {
      out.innerHTML = `<div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-xs text-rose-700">${escapeHtml(err.message)}</div>`;
    }
  });
}

// ===================================================================
// 7. FEATURE 4: INTELLIGENT CANCELLATION WAITLIST & LIVE QUEUE
// ===================================================================
async function renderWaitlistAndQueue() {
  await refreshLookupCaches();
  const today = new Date().toISOString().split('T')[0];

  app.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            Cancellation Waitlist & Live Patient Queue
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            FIFO automated waitlist matching on appointment cancellations and live outpatient queue tracking.
          </p>
        </div>
        <button id="join-waitlist-btn" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Join Waitlist
        </button>
      </div>

      <!-- Live Outpatient Queue Section -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 class="text-base font-bold text-slate-900">Today's Live Outpatient Queue</h3>
            <p class="text-xs text-slate-500 mt-0.5">Real-time queue sequence, check-in status, and estimated wait times (20m per patient)</p>
          </div>
          <div class="flex items-center gap-2">
            <input type="date" id="queue-date" value="${today}" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none" />
            <select id="queue-doctor" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none">
              <option value="">All Doctors</option>
              ${cachedDoctors.filter(d => d.active).map(d => `<option value="${d.doctorId}">Dr. ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div id="queue-table-container" class="overflow-x-auto">
          <div class="p-8 text-center text-slate-400">Loading queue...</div>
        </div>
      </div>

      <!-- Cancellation Waitlist Section -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 class="text-base font-bold text-slate-900">Cancellation Waitlist Directory</h3>
            <p class="text-xs text-slate-500 mt-0.5">When an appointment is cancelled, the engine offers the slot to the next candidate in FIFO order.</p>
          </div>
          <span class="text-xs text-slate-400">Automatic Cascading Enabled</span>
        </div>

        <div id="waitlist-table-container" class="overflow-x-auto">
          <div class="p-8 text-center text-slate-400">Loading waitlist...</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('join-waitlist-btn').addEventListener('click', () => openJoinWaitlistModal());

  const queueDateInput = document.getElementById('queue-date');
  const queueDocSelect = document.getElementById('queue-doctor');

  const reloadQueue = () => {
    loadLiveQueueTable(queueDateInput.value, queueDocSelect.value);
  };

  queueDateInput.addEventListener('change', reloadQueue);
  queueDocSelect.addEventListener('change', reloadQueue);

  loadLiveQueueTable(today, '');
  loadWaitlistTable();
}

async function loadLiveQueueTable(date, doctorId) {
  const container = document.getElementById('queue-table-container');
  if (!container) return;

  try {
    const queue = await api.getLiveQueue({ date, doctorId: doctorId || null });
    if (!queue || queue.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">No outpatient appointments found in queue for ${date}.</div>`;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left text-sm border-collapse">
        <thead>
          <tr class="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th class="py-3 px-4">Pos</th>
            <th class="py-3 px-4">Patient</th>
            <th class="py-3 px-4">Doctor</th>
            <th class="py-3 px-4">Scheduled Slot</th>
            <th class="py-3 px-4">Estimated Wait</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${queue.map(q => `
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-bold text-slate-900 font-mono text-base">#${q.queuePosition}</td>
              <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(q.patientName)}</td>
              <td class="py-3 px-4 text-slate-700">${escapeHtml(q.doctorName)}</td>
              <td class="py-3 px-4 font-mono text-xs text-slate-600">${q.scheduledStartTime?.substring(0,5)} - ${q.scheduledEndTime?.substring(0,5)}</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${q.estimatedWaitMinutes === 0 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'}">
                  ${q.estimatedWaitMinutes === 0 ? 'Next in line (0m)' : `~${q.estimatedWaitMinutes} mins`}
                </span>
              </td>
              <td class="py-3 px-4">${formatStatus(q.status)}</td>
              <td class="py-3 px-4 text-right">
                ${q.status !== 'CHECKED_IN' ? `
                  <button onclick="window.handleCheckIn(${q.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Check In</button>
                ` : `
                  <span class="text-xs text-emerald-600 font-medium">Checked In</span>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-center text-rose-600 text-xs">${escapeHtml(err.message)}</div>`;
  }
}

async function loadWaitlistTable() {
  const container = document.getElementById('waitlist-table-container');
  if (!container) return;

  try {
    const list = await api.getWaitlist();
    if (!list || list.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-slate-400 text-xs">Waitlist is currently empty. Click "Join Waitlist" above to register a patient.</div>`;
      return;
    }

    container.innerHTML = `
      <table class="w-full text-left text-sm border-collapse">
        <thead>
          <tr class="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
            <th class="py-3 px-4">ID</th>
            <th class="py-3 px-4">Patient</th>
            <th class="py-3 px-4">Specialization / Doctor</th>
            <th class="py-3 px-4">Preferred Date & Window</th>
            <th class="py-3 px-4">Offered Slot Details</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${list.map(w => `
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${w.waitlistId}</td>
              <td class="py-3 px-4 font-semibold text-slate-900">${escapeHtml(w.patientName)}</td>
              <td class="py-3 px-4 text-xs">
                <span class="font-medium text-slate-800 block">${escapeHtml(w.specialization || 'Any')}</span>
                <span class="text-slate-500">${escapeHtml(w.doctorName || 'Any doctor in specialty')}</span>
              </td>
              <td class="py-3 px-4 text-xs font-mono text-slate-700">
                <span class="block">${w.preferredDate}</span>
                <span class="text-slate-500 text-[11px]">${w.preferredStartTime ? `${w.preferredStartTime.substring(0,5)} - ${w.preferredEndTime?.substring(0,5)}` : 'Any time of day'}</span>
              </td>
              <td class="py-3 px-4 text-xs">
                ${w.offeredAppointmentDate ? `
                  <div class="bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <span class="font-bold text-purple-900 block">${w.offeredDoctorName}</span>
                    <span class="font-mono text-purple-800 block">${w.offeredAppointmentDate} (${w.offeredStartTime?.substring(0,5)} - ${w.offeredEndTime?.substring(0,5)})</span>
                    ${w.offerExpiresAt ? `<span class="text-[10px] text-purple-600 block">Expires: ${w.offerExpiresAt.replace('T', ' ').substring(0,16)}</span>` : ''}
                  </div>
                ` : `<span class="text-slate-400 italic">Awaiting cancellation</span>`}
              </td>
              <td class="py-3 px-4">${formatStatus(w.status)}</td>
              <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
                ${w.status === 'OFFERED' ? `
                  <button onclick="window.handleAcceptWaitlist(${w.waitlistId})" class="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition">
                    Accept & Book
                  </button>
                  <button onclick="window.handleRejectWaitlist(${w.waitlistId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">
                    Pass to Next
                  </button>
                ` : `
                  <span class="text-xs text-slate-400 italic">No action</span>
                `}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (err) {
    container.innerHTML = `<div class="p-6 text-center text-rose-600 text-xs">${escapeHtml(err.message)}</div>`;
  }
}

function openJoinWaitlistModal() {
  const activePatients = cachedPatients.filter(p => p.active);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Join Cancellation Waitlist</h3>
    <p class="text-xs text-slate-500 mb-4">When a matching slot is cancelled by another patient, the engine automatically offers it to you in FIFO order.</p>

    <form id="join-waitlist-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Patient *</label>
        <select name="patientId" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
          ${activePatients.map(p => `<option value="${p.patientId}">${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}</option>`).join('')}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Preferred Doctor (Optional)</label>
          <select name="doctorId" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="">Any Available Doctor in Specialty</option>
            ${cachedDoctors.filter(d => d.active).map(d => `<option value="${d.doctorId}">Dr. ${escapeHtml(d.firstName)} ${escapeHtml(d.lastName)} (${escapeHtml(d.specialization)})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
          <select name="specialization" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="">Any Specialization</option>
            ${cachedSpecializations.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
          <input type="date" name="preferredDate" required value="${tomorrow}" min="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Earliest Time</label>
          <input type="time" name="preferredStartTime" value="09:00" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Latest Time</label>
          <input type="time" name="preferredEndTime" value="17:00" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Patient Notes / Condition</label>
        <textarea name="notes" rows="2" placeholder="e.g. Can come immediately on 30-minute notice..." class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow transition">
          Register on Waitlist
        </button>
      </div>
    </form>
  `);

  document.getElementById('join-waitlist-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      patientId: Number(formData.get('patientId')),
      doctorId: formData.get('doctorId') ? Number(formData.get('doctorId')) : null,
      specialization: formData.get('specialization') || null,
      preferredDate: formData.get('preferredDate'),
      preferredStartTime: formData.get('preferredStartTime') ? formData.get('preferredStartTime') + ':00' : null,
      preferredEndTime: formData.get('preferredEndTime') ? formData.get('preferredEndTime') + ':00' : null,
      notes: formData.get('notes'),
    };

    try {
      await api.addToWaitlist(data);
      showToast('Patient added to cancellation waitlist successfully');
      closeModal();
      loadWaitlistTable();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

window.handleAcceptWaitlist = async (id) => {
  try {
    await api.acceptWaitlistOffer(id);
    showToast('Waitlist offer accepted! Appointment officially booked.');
    loadWaitlistTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleRejectWaitlist = async (id) => {
  try {
    await api.rejectWaitlistOffer(id);
    showToast('Offer declined. The slot will now cascade to the next eligible patient.', 'info');
    loadWaitlistTable();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// ===================================================================
// 8. SCHEDULE CONFLICT SCANNER VIEW
// ===================================================================
async function renderConflicts() {
  const today = new Date().toISOString().split('T')[0];

  app.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </span>
            Administrative Schedule Conflict Scanner
          </h2>
          <p class="text-sm text-slate-500 mt-1">
            Detects doctor double-bookings, patient concurrent overlaps, and protected rest period violations across active records.
          </p>
        </div>
        <div class="flex items-center gap-3">
          <input type="date" id="scan-from-date" value="${today}" class="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none" />
          <button id="run-scan-btn" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Scan Integrity
          </button>
        </div>
      </div>

      <!-- Live Scan Output Container -->
      <div id="conflicts-output" class="animate-fade-in">
        <div class="p-12 text-center text-slate-400">Loading schedule integrity scan...</div>
      </div>
    </div>
  `;

  const runScan = async (fromDate) => {
    const container = document.getElementById('conflicts-output');
    if (!container) return;
    container.innerHTML = `<div class="p-12 text-center text-slate-400">Running full-spectrum schedule collision scan...</div>`;

    try {
      const report = await api.getScheduleConflicts(fromDate);

      const isHealthy = report.systemIntegrityStatus === 'HEALTHY' && report.totalConflicts === 0;

      container.innerHTML = `
        <div class="space-y-5">
          <!-- Status Banner -->
          <div class="p-5 rounded-2xl border ${isHealthy ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'} flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl ${isHealthy ? 'bg-emerald-600' : 'bg-rose-600'} text-white flex items-center justify-center font-bold">
                ${isHealthy ? '✓' : '!'}
              </span>
              <div>
                <h3 class="text-base font-bold">${isHealthy ? 'Schedule Integrity Verified: 100% Conflict-Free' : 'Schedule Attention Required'}</h3>
                <p class="text-xs ${isHealthy ? 'text-emerald-700' : 'text-rose-700'} mt-0.5">
                  ${isHealthy ? 'All active appointments strictly honor doctor availability, 20-minute slot boundaries, and protected rest intervals.' : `Detected ${report.totalConflicts} potential schedule conflict(s) that violate clinical boundary rules.`}
                </p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold ${isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
              ${report.systemIntegrityStatus}
            </span>
          </div>

          <!-- Conflict Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-xs font-semibold uppercase text-slate-400 block">Doctor Overlaps</span>
              <span class="text-2xl font-bold text-slate-900 mt-1 block">${report.doctorOverlapConflicts}</span>
              <span class="text-[11px] text-slate-500">Double-booked slots</span>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-xs font-semibold uppercase text-slate-400 block">Patient Overlaps</span>
              <span class="text-2xl font-bold text-slate-900 mt-1 block">${report.patientOverlapConflicts}</span>
              <span class="text-[11px] text-slate-500">Simultaneous patient bookings</span>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-xs font-semibold uppercase text-slate-400 block">Rest Period Violations</span>
              <span class="text-2xl font-bold text-slate-900 mt-1 block">${report.restPeriodConflicts}</span>
              <span class="text-[11px] text-slate-500">Intrusion into protected breaks</span>
            </div>
          </div>

          <!-- Conflicts List -->
          ${(!isHealthy && report.conflicts && report.conflicts.length > 0) ? `
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div class="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 uppercase">
                Detected Conflicts (${report.conflicts.length})
              </div>
              <div class="divide-y divide-slate-100 text-xs">
                ${report.conflicts.map(c => `
                  <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          ${escapeHtml(c.conflictType)}
                        </span>
                        <span class="font-bold text-slate-900">Appt #${c.appointmentId}${c.secondaryAppointmentId ? ` & #${c.secondaryAppointmentId}` : ''}</span>
                        <span class="text-slate-500 font-mono">${c.date} (${c.startTime?.substring(0,5)} - ${c.endTime?.substring(0,5)})</span>
                      </div>
                      <p class="text-slate-700 mt-1 font-medium">${escapeHtml(c.description)}</p>
                      <p class="text-indigo-600 mt-0.5">Recommendation: ${escapeHtml(c.recommendation)}</p>
                    </div>
                    <button onclick="window.switchTab('appointments')" class="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition whitespace-nowrap self-start sm:self-auto">
                      Resolve &rarr;
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      `;
    } catch (err) {
      container.innerHTML = `<div class="p-6 text-center text-rose-600 text-xs">${escapeHtml(err.message)}</div>`;
    }
  };

  document.getElementById('run-scan-btn')?.addEventListener('click', () => {
    runScan(document.getElementById('scan-from-date').value);
  });

  runScan(today);
}

// Global Handlers for inline buttons
window.switchTab = switchTab;
window.closeModal = closeModal;
window.renderDashboard = renderDashboard;

window.handleCheckIn = async (id) => {
  try {
    await api.checkInAppointment(id);
    showToast(`Patient checked in successfully for Appointment #${id}`);
    if (currentTab === 'dashboard') renderDashboard();
    else if (currentTab === 'queue') renderWaitlistAndQueue();
    else renderAppointments();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleEditPatient = async (id) => {
  try {
    const patient = await api.getPatient(id);
    openPatientModal(patient);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleDeactivatePatient = async (id, name) => {
  if (!confirm(`Are you sure you want to deactivate patient "${name}"?\nHistorical appointments will be preserved.`)) return;
  try {
    await api.deactivatePatient(id);
    showToast(`Patient "${name}" deactivated successfully.`);
    renderPatients();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleEditDoctor = async (id) => {
  try {
    const doctor = await api.getDoctor(id);
    openDoctorModal(doctor);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleManageAvailability = (id, name) => {
  openDoctorAvailabilityModal(id, name);
};

window.handleManageRestPeriods = (id, name) => {
  openDoctorRestPeriodsModal(id, name);
};

window.handleViewTimeline = (id, name) => {
  openDoctorTimelineModal(id, name);
};

window.handleDeleteAvailability = async (availabilityId, doctorId, name) => {
  if (!confirm('Remove this availability shift?')) return;
  try {
    await api.deleteDoctorAvailability(availabilityId);
    showToast('Availability shift deleted');
    openDoctorAvailabilityModal(doctorId, name);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleDeleteRestPeriod = async (restId, doctorId, name) => {
  if (!confirm('Remove this protected rest period?')) return;
  try {
    await api.deleteDoctorRestPeriod(restId);
    showToast('Protected rest period removed');
    openDoctorRestPeriodsModal(doctorId, name);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleRescheduleModal = (id, curDate, curStart, curEnd) => {
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Reschedule Appointment #${id}</h3>
    <p class="text-xs text-slate-500 mb-4">Every appointment must last exactly 20 minutes and avoid protected doctor rest periods.</p>

    <form id="reschedule-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">New Date *</label>
        <input type="date" name="appointmentDate" required value="${curDate}" min="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New Start Time *</label>
          <input type="time" name="startTime" id="reschedule-start-time" required value="${curStart?.substring(0,5)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New End Time (Auto 20m) *</label>
          <input type="time" name="endTime" id="reschedule-end-time" readonly required value="${addMinutesToTime(curStart?.substring(0,5), 20)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">Save New Time</button>
      </div>
    </form>
  `);

  const startIn = document.getElementById('reschedule-start-time');
  const endIn = document.getElementById('reschedule-end-time');
  startIn.addEventListener('input', () => {
    endIn.value = addMinutesToTime(startIn.value, 20);
  });

  document.getElementById('reschedule-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      appointmentDate: formData.get('appointmentDate'),
      startTime: formData.get('startTime') + ':00',
      endTime: formData.get('endTime') + ':00',
    };

    try {
      await api.rescheduleAppointment(id, data);
      showToast('Appointment rescheduled successfully');
      closeModal();
      if (currentTab === 'dashboard') renderDashboard();
      else renderAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
};

window.handleCancelModal = (id) => {
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Cancel Appointment #${id}</h3>
    <p class="text-xs text-slate-500 mb-4">Please provide a reason. When cancelled, the slot will be offered to patients waiting on the cancellation list.</p>

    <form id="cancel-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Cancellation Reason *</label>
        <textarea name="cancellationReason" required rows="3" placeholder="e.g. Patient called due to urgent family emergency..." class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Close</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow transition">Cancel Appointment</button>
      </div>
    </form>
  `);

  document.getElementById('cancel-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const reason = formData.get('cancellationReason');

    try {
      await api.cancelAppointment(id, reason);
      showToast('Appointment cancelled successfully (slot released to waitlist)', 'info');
      closeModal();
      if (currentTab === 'dashboard') renderDashboard();
      else if (currentTab === 'queue') renderWaitlistAndQueue();
      else renderAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
};

window.handleStatusUpdate = async (id, status) => {
  try {
    await api.updateAppointmentStatus(id, status);
    showToast(`Appointment #${id} marked as ${status}`);
    if (currentTab === 'dashboard') renderDashboard();
    else if (currentTab === 'queue') renderWaitlistAndQueue();
    else renderAppointments();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Application Bootstrap
refreshLookupCaches().then(() => {
  switchTab('dashboard');
});
