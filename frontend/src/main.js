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
  };
  const icons = {
    success: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`,
    error: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>`,
    info: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
  };

  toast.className = `${bgColors[type] || bgColors.info} p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0 text-sm font-medium`;
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
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-fade-in border border-slate-100">
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
    COMPLETED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Completed' },
    CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Cancelled' },
    RESCHEDULED: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Rescheduled' },
    NO_SHOW: { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'No Show' },
  };
  const item = map[status] || { bg: 'bg-slate-100 text-slate-600 border-slate-200', label: status };
  return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg}">${item.label}</span>`;
}

// Tab Switching
function switchTab(tab) {
  currentTab = tab;
  Object.keys(navBtns).forEach((key) => {
    const btn = navBtns[key];
    if (key === tab) {
      btn.className = 'nav-btn px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 text-sky-700 bg-sky-50 border border-sky-200/60 shadow-xs';
    } else {
      btn.className = 'nav-btn px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 flex items-center gap-2';
    }
  });

  if (tab === 'dashboard') renderDashboard();
  else if (tab === 'appointments') renderAppointments();
  else if (tab === 'patients') renderPatients();
  else if (tab === 'doctors') renderDoctors();
}

Object.keys(navBtns).forEach((key) => {
  navBtns[key].addEventListener('click', () => switchTab(key));
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
          <div class="flex items-center gap-2">
            <button id="quick-book-btn" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Book Appointment
            </button>
            <button id="quick-patient-btn" class="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium rounded-xl text-sm shadow-xs transition flex items-center gap-1.5">
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
              <h3 class="text-base font-bold text-slate-900">Upcoming Appointments</h3>
              <p class="text-xs text-slate-500 mt-0.5">Upcoming scheduled consultations</p>
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
                      <span class="text-xs text-slate-500 block">${appt.startTime?.substring(0,5)} - ${appt.endTime?.substring(0,5)}</span>
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-900">${escapeHtml(appt.patientName)}</td>
                    <td class="py-3.5 px-4 text-slate-700">${escapeHtml(appt.doctorName)}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">${escapeHtml(appt.doctorSpecialization)}</span>
                    </td>
                    <td class="py-3.5 px-4">${formatStatus(appt.status)}</td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      <button onclick="window.handleRescheduleModal(${appt.appointmentId}, '${appt.appointmentDate}', '${appt.startTime}', '${appt.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                      <button onclick="window.handleCancelModal(${appt.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" class="text-center py-10 text-slate-400 font-medium text-sm">
                      No upcoming appointments found. Click "Book Appointment" above to create one.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

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
          <p class="text-sm text-slate-500 mt-0.5">Manage doctor profiles, specializations, consultation fees, and working hours</p>
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

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Consultation</span>
            <span class="font-bold text-slate-900 text-sm">₹${Number(doc.consultationFee).toFixed(2)}</span>
          </div>
          <div class="space-x-1.5">
            <button onclick="window.handleManageAvailability(${doc.doctorId}, 'Dr. ${escapeHtml(doc.firstName)} ${escapeHtml(doc.lastName)}')" class="px-2.5 py-1.5 font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">
              Availability
            </button>
            <button onclick="window.handleEditDoctor(${doc.doctorId})" class="px-2.5 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
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
    <h3 class="text-lg font-bold text-slate-900 mb-1">Manage Availability — ${escapeHtml(doctorName)}</h3>
    <p class="text-xs text-slate-500 mb-4">Add or view working date & time slots for this doctor.</p>

    <!-- Add Availability Slot Form -->
    <form id="add-availability-form" class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 mb-4">
      <h4 class="text-xs font-bold uppercase text-slate-700 tracking-wider">Add Scheduled Slot</h4>
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
          <input type="time" name="endTime" required value="13:00" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
      </div>
      <div class="flex justify-end">
        <button type="submit" class="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-xs transition">
          + Add Slot
        </button>
      </div>
    </form>

    <!-- Slot list -->
    <div id="availability-slots-list" class="space-y-2 max-h-56 overflow-y-auto">
      <p class="text-xs text-slate-400 text-center py-4">Loading slots...</p>
    </div>
  `);

  const refreshSlots = async () => {
    const list = document.getElementById('availability-slots-list');
    if (!list) return;

    try {
      const slots = await api.getDoctorAvailability(doctorId);
      if (!slots || slots.length === 0) {
        list.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No scheduled availability configured for this doctor.</p>`;
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
      showToast('Availability slot added');
      refreshSlots();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  refreshSlots();
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
          <p class="text-sm text-slate-500 mt-0.5">Book consultations, detect schedule conflicts, reschedule, or record visit status</p>
        </div>
        <button id="book-appt-btn" class="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-1.5 self-start sm:self-auto">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Book Appointment
        </button>
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
                <span class="text-xs font-mono text-slate-500">${a.startTime?.substring(0,5)} - ${a.endTime?.substring(0,5)}</span>
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
                  <button onclick="window.handleStatusUpdate(${a.appointmentId}, 'COMPLETED')" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Complete</button>
                  <button onclick="window.handleRescheduleModal(${a.appointmentId}, '${a.appointmentDate}', '${a.startTime}', '${a.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                  <button onclick="window.handleCancelModal(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                ` : `
                  <span class="text-xs text-slate-400 italic">No actions</span>
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
    <h3 class="text-lg font-bold text-slate-900 mb-1">Book New Appointment</h3>
    <p class="text-xs text-slate-500 mb-4">Select patient, doctor, and consultation slot. Overlap collision checks are enforced via JDBC.</p>

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
          <input type="time" name="startTime" required value="09:00" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
          <input type="time" name="endTime" required value="09:30" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
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
          Confirm Booking
        </button>
      </div>
    </form>
  `);

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
      showToast('Appointment booked successfully!');
      closeModal();
      if (currentTab === 'dashboard') renderDashboard();
      else renderAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Global Handlers for inline buttons
window.switchTab = switchTab;
window.closeModal = closeModal;
window.renderDashboard = renderDashboard;

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

window.handleDeleteAvailability = async (availabilityId, doctorId, name) => {
  if (!confirm('Remove this availability slot?')) return;
  try {
    await api.deleteDoctorAvailability(availabilityId);
    showToast('Availability slot deleted');
    openDoctorAvailabilityModal(doctorId, name);
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleRescheduleModal = (id, curDate, curStart, curEnd) => {
  openModal(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Reschedule Appointment #${id}</h3>
    <p class="text-xs text-slate-500 mb-4">Select a new date and time. Overlap detection will prevent doctor collisions.</p>

    <form id="reschedule-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">New Date *</label>
        <input type="date" name="appointmentDate" required value="${curDate}" min="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New Start Time *</label>
          <input type="time" name="startTime" required value="${curStart?.substring(0,5)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New End Time *</label>
          <input type="time" name="endTime" required value="${curEnd?.substring(0,5)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">Save New Time</button>
      </div>
    </form>
  `);

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
    <p class="text-xs text-slate-500 mb-4">Please provide a reason for cancelling this appointment.</p>

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
      showToast('Appointment cancelled successfully', 'info');
      closeModal();
      if (currentTab === 'dashboard') renderDashboard();
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
    else renderAppointments();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// Application Bootstrap
refreshLookupCaches().then(() => {
  switchTab('dashboard');
});
