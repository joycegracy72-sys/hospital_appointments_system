(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))t(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const c of l.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&t(c)}).observe(document,{childList:!0,subtree:!0});function a(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function t(s){if(s.ep)return;s.ep=!0;const l=a(s);fetch(s.href,l)}})();const j="/api";async function d(e,o={}){const a=`${j}${e}`,t={headers:{"Content-Type":"application/json",Accept:"application/json",...o.headers||{}},...o};try{const s=await fetch(a,t),l=await s.json().catch(()=>null);if(!s.ok){const c=l&&(l.message||l.error)||`HTTP ${s.status}: ${s.statusText}`,p=l&&l.data?Object.values(l.data).join(", "):null;throw new Error(p?`${c} (${p})`:c)}return l?l.data:null}catch(s){throw console.error(`API Error on ${a}:`,s),s}}const i={getDashboardStats(){return d("/dashboard/stats")},getPatients(e="",o=!1){const a=new URLSearchParams;e&&a.append("search",e),o&&a.append("activeOnly","true");const t=a.toString();return d(`/patients${t?"?"+t:""}`)},getPatient(e){return d(`/patients/${e}`)},createPatient(e){return d("/patients",{method:"POST",body:JSON.stringify(e)})},updatePatient(e,o){return d(`/patients/${e}`,{method:"PUT",body:JSON.stringify(o)})},deactivatePatient(e){return d(`/patients/${e}`,{method:"DELETE"})},getDoctors(e="",o="",a=!1){const t=new URLSearchParams;e&&t.append("search",e),o&&t.append("specialization",o),a&&t.append("activeOnly","true");const s=t.toString();return d(`/doctors${s?"?"+s:""}`)},getDoctor(e){return d(`/doctors/${e}`)},createDoctor(e){return d("/doctors",{method:"POST",body:JSON.stringify(e)})},updateDoctor(e,o){return d(`/doctors/${e}`,{method:"PUT",body:JSON.stringify(o)})},getSpecializations(){return d("/doctors/specializations")},getDoctorAvailability(e){return d(`/doctors/${e}/availability`)},addDoctorAvailability(e,o){return d(`/doctors/${e}/availability`,{method:"POST",body:JSON.stringify(o)})},deleteDoctorAvailability(e){return d(`/doctors/availability/${e}`,{method:"DELETE"})},getAppointments({date:e,doctorId:o,patientId:a,status:t}={}){const s=new URLSearchParams;e&&s.append("date",e),o&&s.append("doctorId",o),a&&s.append("patientId",a),t&&s.append("status",t);const l=s.toString();return d(`/appointments${l?"?"+l:""}`)},getAppointment(e){return d(`/appointments/${e}`)},bookAppointment(e){return d("/appointments",{method:"POST",body:JSON.stringify(e)})},rescheduleAppointment(e,o){return d(`/appointments/${e}/reschedule`,{method:"PUT",body:JSON.stringify(o)})},cancelAppointment(e,o){return d(`/appointments/${e}/cancel`,{method:"PUT",body:JSON.stringify({cancellationReason:o})})},updateAppointmentStatus(e,o,a=""){const t=new URLSearchParams({status:o});return a&&t.append("notes",a),d(`/appointments/${e}/status?${t.toString()}`,{method:"PATCH"})}};let g="dashboard",y=[],E=[],T=[];const m=document.getElementById("app"),b=document.getElementById("modal-container"),O=document.getElementById("toast-container"),h={dashboard:document.getElementById("nav-dashboard"),appointments:document.getElementById("nav-appointments"),patients:document.getElementById("nav-patients"),doctors:document.getElementById("nav-doctors")};function r(e,o="success"){const a=document.createElement("div"),t={success:"bg-emerald-600 text-white",error:"bg-rose-600 text-white",info:"bg-sky-600 text-white"},s={success:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',error:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',info:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'};a.className=`${t[o]||t.info} p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0 text-sm font-medium`,a.innerHTML=`
    <span class="flex-shrink-0">${s[o]||s.info}</span>
    <span class="flex-1">${n(e)}</span>
    <button class="text-white/80 hover:text-white ml-2" onclick="this.parentElement.remove()">&times;</button>
  `,O.appendChild(a),requestAnimationFrame(()=>{a.classList.remove("translate-y-2","opacity-0")}),setTimeout(()=>{a.classList.add("opacity-0","translate-y-2"),setTimeout(()=>a.remove(),300)},4500)}function x(e){var o;b.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-fade-in border border-slate-100">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      ${e}
    </div>
  `,b.classList.remove("hidden"),(o=document.getElementById("close-modal-btn"))==null||o.addEventListener("click",u)}function u(){b.classList.add("hidden"),b.innerHTML=""}b.addEventListener("click",e=>{e.target===b&&u()});function n(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function B(e){const a={SCHEDULED:{bg:"bg-sky-50 text-sky-700 border-sky-200",label:"Scheduled"},COMPLETED:{bg:"bg-emerald-50 text-emerald-700 border-emerald-200",label:"Completed"},CANCELLED:{bg:"bg-rose-50 text-rose-700 border-rose-200",label:"Cancelled"},RESCHEDULED:{bg:"bg-amber-50 text-amber-700 border-amber-200",label:"Rescheduled"},NO_SHOW:{bg:"bg-slate-100 text-slate-700 border-slate-200",label:"No Show"}}[e]||{bg:"bg-slate-100 text-slate-600 border-slate-200",label:e};return`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${a.bg}">${a.label}</span>`}function L(e){g=e,Object.keys(h).forEach(o=>{const a=h[o];o===e?a.className="nav-btn px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 flex items-center gap-2 text-sky-700 bg-sky-50 border border-sky-200/60 shadow-xs":a.className="nav-btn px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 flex items-center gap-2"}),e==="dashboard"?f():e==="appointments"?v():e==="patients"?A():e==="doctors"&&N()}Object.keys(h).forEach(e=>{h[e].addEventListener("click",()=>L(e))});async function w(){try{const[e,o,a]=await Promise.all([i.getDoctors("","",!1),i.getPatients("",!1),i.getSpecializations()]);y=e||[],E=o||[],T=a||[]}catch(e){console.warn("Could not refresh lookups:",e)}}async function f(){var e,o;m.innerHTML=`
    <div class="flex items-center justify-center py-16">
      <div class="inline-flex items-center gap-3 text-slate-500 font-medium text-sm">
        <svg class="animate-spin h-5 w-5 text-sky-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Loading live dashboard statistics...
      </div>
    </div>
  `;try{const a=await i.getDashboardStats();await w(),m.innerHTML=`
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
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${a.totalPatients}</h3>
            </div>
          </div>

          <!-- Total Doctors -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Doctors on Duty</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${a.totalDoctors}</h3>
            </div>
          </div>

          <!-- Today's Consultations -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Visits</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${a.todayAppointmentsCount}</h3>
            </div>
          </div>

          <!-- Scheduled Appointments -->
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Scheduled</p>
              <h3 class="text-2xl font-bold text-slate-900 mt-0.5">${a.upcomingAppointmentsCount}</h3>
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
                ${a.upcomingAppointments&&a.upcomingAppointments.length>0?a.upcomingAppointments.map(t=>{var s,l;return`
                  <tr class="hover:bg-slate-50/50 transition">
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="font-medium text-slate-900">${t.appointmentDate}</span>
                      <span class="text-xs text-slate-500 block">${(s=t.startTime)==null?void 0:s.substring(0,5)} - ${(l=t.endTime)==null?void 0:l.substring(0,5)}</span>
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-900">${n(t.patientName)}</td>
                    <td class="py-3.5 px-4 text-slate-700">${n(t.doctorName)}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">${n(t.doctorSpecialization)}</span>
                    </td>
                    <td class="py-3.5 px-4">${B(t.status)}</td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      <button onclick="window.handleRescheduleModal(${t.appointmentId}, '${t.appointmentDate}', '${t.startTime}', '${t.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                      <button onclick="window.handleCancelModal(${t.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                    </td>
                  </tr>
                `}).join(""):`
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
    `,(e=document.getElementById("quick-book-btn"))==null||e.addEventListener("click",()=>I()),(o=document.getElementById("quick-patient-btn"))==null||o.addEventListener("click",()=>k())}catch(a){m.innerHTML=`
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 class="text-base font-bold text-rose-900">Failed to connect to Spring Boot backend</h3>
        <p class="text-xs text-rose-700 mt-1">${n(a.message)}</p>
        <button onclick="window.renderDashboard()" class="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition">
          Retry Connection
        </button>
      </div>
    `}}async function A(e="",o=!1){m.innerHTML=`
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
          <input type="text" id="patient-search-input" value="${n(e)}" placeholder="Search by patient name, email, or phone number..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <label class="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer self-center px-1">
          <input type="checkbox" id="patient-active-only" ${o?"checked":""} class="rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
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
  `,document.getElementById("add-patient-btn").addEventListener("click",()=>k());const a=document.getElementById("patient-search-input"),t=document.getElementById("patient-active-only");let s;a.addEventListener("input",l=>{clearTimeout(s),s=setTimeout(()=>{$(l.target.value,t.checked)},300)}),t.addEventListener("change",()=>{$(a.value,t.checked)}),$(e,o)}async function $(e,o){const a=document.getElementById("patients-table-container");if(a)try{const t=await i.getPatients(e,o);if(E=t,!t||t.length===0){a.innerHTML=`
        <div class="p-12 text-center">
          <p class="text-slate-500 font-medium text-sm">No patients found matching your search criteria.</p>
        </div>
      `;return}a.innerHTML=`
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
          ${t.map(s=>`
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${s.patientId}</td>
              <td class="py-3 px-4">
                <span class="font-semibold text-slate-900 block">${n(s.firstName)} ${n(s.lastName)}</span>
                <span class="text-xs text-slate-500">${n(s.address||"Address not specified")}</span>
              </td>
              <td class="py-3 px-4 text-xs">
                <div class="font-medium text-slate-800">${n(s.phone)}</div>
                <div class="text-slate-500">${n(s.email)}</div>
              </td>
              <td class="py-3 px-4 text-xs text-slate-700">
                <div>${s.dateOfBirth}</div>
                <div class="text-slate-500 font-medium">${s.gender}</div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-xs font-bold ${s.bloodGroup?"bg-rose-50 text-rose-700 border border-rose-200/80":"text-slate-400"}">
                  ${s.bloodGroup||"N/A"}
                </span>
              </td>
              <td class="py-3 px-4">
                ${s.active?'<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>':'<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Deactivated</span>'}
              </td>
              <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                <button onclick="window.handleEditPatient(${s.patientId})" class="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Edit</button>
                ${s.active?`<button onclick="window.handleDeactivatePatient(${s.patientId}, '${n(s.firstName)} ${n(s.lastName)}')" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Deactivate</button>`:""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}catch(t){a.innerHTML=`<div class="p-6 text-center text-rose-600 text-sm">Failed to load patients: ${n(t.message)}</div>`}}function k(e=null){const o=!!e;x(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">${o?"Update Patient Details":"Register New Patient"}</h3>
    <p class="text-xs text-slate-500 mb-4">Fill in the patient's personal and contact information below.</p>
    
    <form id="patient-form" class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
          <input type="text" name="firstName" required value="${n((e==null?void 0:e.firstName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Arun" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
          <input type="text" name="lastName" required value="${n((e==null?void 0:e.lastName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Kumar" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" name="email" required value="${n((e==null?void 0:e.email)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="arun@example.com" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" name="phone" required value="${n((e==null?void 0:e.phone)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="+91 9876543210" />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date of Birth *</label>
          <input type="date" name="dateOfBirth" required value="${(e==null?void 0:e.dateOfBirth)||"2000-01-01"}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
          <select name="gender" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="MALE" ${(e==null?void 0:e.gender)==="MALE"?"selected":""}>Male</option>
            <option value="FEMALE" ${(e==null?void 0:e.gender)==="FEMALE"?"selected":""}>Female</option>
            <option value="OTHER" ${(e==null?void 0:e.gender)==="OTHER"?"selected":""}>Other</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
          <select name="bloodGroup" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="">Unknown</option>
            ${["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(a=>`<option value="${a}" ${(e==null?void 0:e.bloodGroup)===a?"selected":""}>${a}</option>`).join("")}
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
        <textarea name="address" rows="2" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="Street, City, Postal Code">${n((e==null?void 0:e.address)||"")}</textarea>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          ${o?"Save Changes":"Register Patient"}
        </button>
      </div>
    </form>
  `),document.getElementById("patient-form").addEventListener("submit",async a=>{a.preventDefault();const t=new FormData(a.target),s=Object.fromEntries(t.entries());try{o?(await i.updatePatient(e.patientId,s),r("Patient updated successfully")):(await i.createPatient(s),r("Patient registered successfully")),u(),A()}catch(l){r(l.message,"error")}})}async function N(e="",o=""){m.innerHTML=`
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
          <input type="text" id="doctor-search-input" value="${n(e)}" placeholder="Search doctor by name or email..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div class="sm:w-64">
          <select id="doctor-spec-filter" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="">All Specializations</option>
            ${T.map(l=>`<option value="${n(l)}" ${o===l?"selected":""}>${n(l)}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Doctors Grid -->
      <div id="doctors-grid-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full p-8 text-center text-slate-400">Loading doctors...</div>
      </div>
    </div>
  `,document.getElementById("add-doctor-btn").addEventListener("click",()=>S());const a=document.getElementById("doctor-search-input"),t=document.getElementById("doctor-spec-filter");let s;a.addEventListener("input",l=>{clearTimeout(s),s=setTimeout(()=>{D(l.target.value,t.value)},300)}),t.addEventListener("change",l=>{D(a.value,l.target.value)}),D(e,o)}async function D(e,o){const a=document.getElementById("doctors-grid-container");if(a)try{const t=await i.getDoctors(e,o);if(y=t,!t||t.length===0){a.innerHTML='<div class="col-span-full p-12 text-center text-slate-400 font-medium">No doctors found matching your filter criteria.</div>';return}a.innerHTML=t.map(s=>`
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                ${n(s.specialization)}
              </span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Dr. ${n(s.firstName)} ${n(s.lastName)}</h3>
            </div>
            <span class="text-xs font-mono text-slate-400">#${s.doctorId}</span>
          </div>

          <div class="mt-3 space-y-1 text-xs text-slate-600">
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              ${n(s.email)}
            </p>
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              ${n(s.phone)}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Consultation</span>
            <span class="font-bold text-slate-900 text-sm">₹${Number(s.consultationFee).toFixed(2)}</span>
          </div>
          <div class="space-x-1.5">
            <button onclick="window.handleManageAvailability(${s.doctorId}, 'Dr. ${n(s.firstName)} ${n(s.lastName)}')" class="px-2.5 py-1.5 font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">
              Availability
            </button>
            <button onclick="window.handleEditDoctor(${s.doctorId})" class="px-2.5 py-1.5 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>
      </div>
    `).join("")}catch(t){a.innerHTML=`<div class="col-span-full p-6 text-center text-rose-600 text-sm">Failed to load doctors: ${n(t.message)}</div>`}}function S(e=null){const o=!!e;x(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">${o?"Update Doctor Details":"Add New Medical Specialist"}</h3>
    <p class="text-xs text-slate-500 mb-4">Enter doctor profile, specialization, and fee.</p>

    <form id="doctor-form" class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
          <input type="text" name="firstName" required value="${n((e==null?void 0:e.firstName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Meena" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
          <input type="text" name="lastName" required value="${n((e==null?void 0:e.lastName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Raj" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
          <input type="text" name="specialization" required value="${n((e==null?void 0:e.specialization)||"")}" list="spec-suggestions" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Cardiology" />
          <datalist id="spec-suggestions">
            ${T.map(a=>`<option value="${n(a)}"></option>`).join("")}
          </datalist>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Consultation Fee (₹) *</label>
          <input type="number" step="10" name="consultationFee" required value="${(e==null?void 0:e.consultationFee)||"500"}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" name="email" required value="${n((e==null?void 0:e.email)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="meena@hospital.org" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" name="phone" required value="${n((e==null?void 0:e.phone)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="+91 9876500001" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          ${o?"Save Changes":"Add Doctor"}
        </button>
      </div>
    </form>
  `),document.getElementById("doctor-form").addEventListener("submit",async a=>{a.preventDefault();const t=new FormData(a.target),s=Object.fromEntries(t.entries());try{o?(await i.updateDoctor(e.doctorId,s),r("Doctor profile updated successfully")):(await i.createDoctor(s),r("Doctor registered successfully")),u(),await w(),N()}catch(l){r(l.message,"error")}})}async function P(e,o){var t;x(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Manage Availability — ${n(o)}</h3>
    <p class="text-xs text-slate-500 mb-4">Add or view working date & time slots for this doctor.</p>

    <!-- Add Availability Slot Form -->
    <form id="add-availability-form" class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 mb-4">
      <h4 class="text-xs font-bold uppercase text-slate-700 tracking-wider">Add Scheduled Slot</h4>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">Date *</label>
          <input type="date" name="availableDate" required value="${new Date(Date.now()+864e5).toISOString().split("T")[0]}" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
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
  `);const a=async()=>{const s=document.getElementById("availability-slots-list");if(s)try{const l=await i.getDoctorAvailability(e);if(!l||l.length===0){s.innerHTML='<p class="text-xs text-slate-400 text-center py-4">No scheduled availability configured for this doctor.</p>';return}s.innerHTML=l.map(c=>{var p,M;return`
        <div class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs">
          <div>
            <span class="font-bold text-slate-800">${c.availableDate}</span>
            <span class="text-slate-500 ml-2 font-mono">${(p=c.startTime)==null?void 0:p.substring(0,5)} - ${(M=c.endTime)==null?void 0:M.substring(0,5)}</span>
          </div>
          <button onclick="window.handleDeleteAvailability(${c.availabilityId}, ${e}, '${n(o)}')" class="text-rose-600 hover:text-rose-800 font-medium">
            Delete
          </button>
        </div>
      `}).join("")}catch(l){s.innerHTML=`<p class="text-xs text-rose-600 text-center py-2">${n(l.message)}</p>`}};(t=document.getElementById("add-availability-form"))==null||t.addEventListener("submit",async s=>{s.preventDefault();const l=new FormData(s.target),c={doctorId:e,availableDate:l.get("availableDate"),startTime:l.get("startTime")+":00",endTime:l.get("endTime")+":00"};try{await i.addDoctorAvailability(e,c),r("Availability slot added"),a()}catch(p){r(p.message,"error")}}),a()}async function v(e={}){await w(),m.innerHTML=`
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
          <input type="date" id="appt-date-filter" value="${e.date||""}" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Doctor</label>
          <select id="appt-doctor-filter" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
            <option value="">All Doctors</option>
            ${y.map(l=>`<option value="${l.doctorId}" ${e.doctorId==l.doctorId?"selected":""}>Dr. ${n(l.firstName)} ${n(l.lastName)} (${n(l.specialization)})</option>`).join("")}
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Status</label>
          <select id="appt-status-filter" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
            <option value="">All Statuses</option>
            <option value="SCHEDULED" ${e.status==="SCHEDULED"?"selected":""}>Scheduled</option>
            <option value="COMPLETED" ${e.status==="COMPLETED"?"selected":""}>Completed</option>
            <option value="RESCHEDULED" ${e.status==="RESCHEDULED"?"selected":""}>Rescheduled</option>
            <option value="CANCELLED" ${e.status==="CANCELLED"?"selected":""}>Cancelled</option>
            <option value="NO_SHOW" ${e.status==="NO_SHOW"?"selected":""}>No Show</option>
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
  `,document.getElementById("book-appt-btn").addEventListener("click",()=>I());const o=document.getElementById("appt-date-filter"),a=document.getElementById("appt-doctor-filter"),t=document.getElementById("appt-status-filter"),s=()=>{C({date:o.value,doctorId:a.value,status:t.value})};o.addEventListener("change",s),a.addEventListener("change",s),t.addEventListener("change",s),C(e)}async function C(e){const o=document.getElementById("appointments-table-container");if(o)try{const a=await i.getAppointments(e);if(!a||a.length===0){o.innerHTML=`
        <div class="p-12 text-center">
          <p class="text-slate-500 font-medium text-sm">No appointments found matching your criteria.</p>
        </div>
      `;return}o.innerHTML=`
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
          ${a.map(t=>{var s,l;return`
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${t.appointmentId}</td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="font-semibold text-slate-900 block">${t.appointmentDate}</span>
                <span class="text-xs font-mono text-slate-500">${(s=t.startTime)==null?void 0:s.substring(0,5)} - ${(l=t.endTime)==null?void 0:l.substring(0,5)}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-slate-900 block">${n(t.patientName)}</span>
                <span class="text-xs text-slate-500">${n(t.patientPhone)}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-slate-900 block">${n(t.doctorName)}</span>
                <span class="text-xs text-sky-600 font-medium">${n(t.doctorSpecialization)}</span>
              </td>
              <td class="py-3 px-4 max-w-xs text-xs">
                <p class="text-slate-800 font-medium truncate">${n(t.reasonForVisit||"General Visit")}</p>
                ${t.notes?`<p class="text-slate-500 truncate mt-0.5">Note: ${n(t.notes)}</p>`:""}
                ${t.cancellationReason?`<p class="text-rose-600 font-medium truncate mt-0.5">Cancelled: ${n(t.cancellationReason)}</p>`:""}
              </td>
              <td class="py-3 px-4">${B(t.status)}</td>
              <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                ${t.status==="SCHEDULED"||t.status==="RESCHEDULED"?`
                  <button onclick="window.handleStatusUpdate(${t.appointmentId}, 'COMPLETED')" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Complete</button>
                  <button onclick="window.handleRescheduleModal(${t.appointmentId}, '${t.appointmentDate}', '${t.startTime}', '${t.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                  <button onclick="window.handleCancelModal(${t.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                `:`
                  <span class="text-xs text-slate-400 italic">No actions</span>
                `}
              </td>
            </tr>
          `}).join("")}
        </tbody>
      </table>
    `}catch(a){o.innerHTML=`<div class="p-6 text-center text-rose-600 text-sm">Failed to load appointments: ${n(a.message)}</div>`}}function I(){const e=E.filter(t=>t.active),o=y.filter(t=>t.active);if(e.length===0){r("Please register at least one active patient first.","info"),k();return}if(o.length===0){r("Please register at least one active doctor first.","info"),S();return}const a=new Date(Date.now()+864e5).toISOString().split("T")[0];x(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Book New Appointment</h3>
    <p class="text-xs text-slate-500 mb-4">Select patient, doctor, and consultation slot. Overlap collision checks are enforced via JDBC.</p>

    <form id="book-appt-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Patient *</label>
        <select name="patientId" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
          ${e.map(t=>`<option value="${t.patientId}">${n(t.firstName)} ${n(t.lastName)} (${n(t.phone)})</option>`).join("")}
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Doctor *</label>
        <select name="doctorId" id="book-doctor-select" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
          ${o.map(t=>`<option value="${t.doctorId}">Dr. ${n(t.firstName)} ${n(t.lastName)} — ${n(t.specialization)} (₹${t.consultationFee})</option>`).join("")}
        </select>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
          <input type="date" name="appointmentDate" required value="${a}" min="${new Date().toISOString().split("T")[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
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
  `),document.getElementById("book-appt-form").addEventListener("submit",async t=>{t.preventDefault();const s=new FormData(t.target),l={patientId:Number(s.get("patientId")),doctorId:Number(s.get("doctorId")),appointmentDate:s.get("appointmentDate"),startTime:s.get("startTime")+":00",endTime:s.get("endTime")+":00",reasonForVisit:s.get("reasonForVisit"),notes:s.get("notes")};try{await i.bookAppointment(l),r("Appointment booked successfully!"),u(),g==="dashboard"?f():v()}catch(c){r(c.message,"error")}})}window.switchTab=L;window.closeModal=u;window.renderDashboard=f;window.handleEditPatient=async e=>{try{const o=await i.getPatient(e);k(o)}catch(o){r(o.message,"error")}};window.handleDeactivatePatient=async(e,o)=>{if(confirm(`Are you sure you want to deactivate patient "${o}"?
Historical appointments will be preserved.`))try{await i.deactivatePatient(e),r(`Patient "${o}" deactivated successfully.`),A()}catch(a){r(a.message,"error")}};window.handleEditDoctor=async e=>{try{const o=await i.getDoctor(e);S(o)}catch(o){r(o.message,"error")}};window.handleManageAvailability=(e,o)=>{P(e,o)};window.handleDeleteAvailability=async(e,o,a)=>{if(confirm("Remove this availability slot?"))try{await i.deleteDoctorAvailability(e),r("Availability slot deleted"),P(o,a)}catch(t){r(t.message,"error")}};window.handleRescheduleModal=(e,o,a,t)=>{x(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Reschedule Appointment #${e}</h3>
    <p class="text-xs text-slate-500 mb-4">Select a new date and time. Overlap detection will prevent doctor collisions.</p>

    <form id="reschedule-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">New Date *</label>
        <input type="date" name="appointmentDate" required value="${o}" min="${new Date().toISOString().split("T")[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New Start Time *</label>
          <input type="time" name="startTime" required value="${a==null?void 0:a.substring(0,5)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New End Time *</label>
          <input type="time" name="endTime" required value="${t==null?void 0:t.substring(0,5)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">Save New Time</button>
      </div>
    </form>
  `),document.getElementById("reschedule-form").addEventListener("submit",async s=>{s.preventDefault();const l=new FormData(s.target),c={appointmentDate:l.get("appointmentDate"),startTime:l.get("startTime")+":00",endTime:l.get("endTime")+":00"};try{await i.rescheduleAppointment(e,c),r("Appointment rescheduled successfully"),u(),g==="dashboard"?f():v()}catch(p){r(p.message,"error")}})};window.handleCancelModal=e=>{x(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Cancel Appointment #${e}</h3>
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
  `),document.getElementById("cancel-form").addEventListener("submit",async o=>{o.preventDefault();const t=new FormData(o.target).get("cancellationReason");try{await i.cancelAppointment(e,t),r("Appointment cancelled successfully","info"),u(),g==="dashboard"?f():v()}catch(s){r(s.message,"error")}})};window.handleStatusUpdate=async(e,o)=>{try{await i.updateAppointmentStatus(e,o),r(`Appointment #${e} marked as ${o}`),g==="dashboard"?f():v()}catch(a){r(a.message,"error")}};w().then(()=>{L("dashboard")});
