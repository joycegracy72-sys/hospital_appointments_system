(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function s(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(t){if(t.ep)return;t.ep=!0;const n=s(t);fetch(t.href,n)}})();const X="/api";async function u(e,o={}){const s=`${X}${e}`,a={headers:{"Content-Type":"application/json",Accept:"application/json",...o.headers||{}},...o};try{const t=await fetch(s,a),n=await t.json().catch(()=>null);if(!t.ok){const i=n&&(n.message||n.error)||`HTTP ${t.status}: ${t.statusText}`,c=n&&n.data?Object.values(n.data).join(", "):null;throw new Error(c?`${i} (${c})`:i)}return n?n.data:null}catch(t){throw console.error(`API Error on ${s}:`,t),t}}const p={getDashboardStats(){return u("/dashboard/stats")},getPatients(e="",o=!1){const s=new URLSearchParams;e&&s.append("search",e),o&&s.append("activeOnly","true");const a=s.toString();return u(`/patients${a?"?"+a:""}`)},getPatient(e){return u(`/patients/${e}`)},createPatient(e){return u("/patients",{method:"POST",body:JSON.stringify(e)})},updatePatient(e,o){return u(`/patients/${e}`,{method:"PUT",body:JSON.stringify(o)})},deactivatePatient(e){return u(`/patients/${e}`,{method:"DELETE"})},getDoctors(e="",o="",s=!1){const a=new URLSearchParams;e&&a.append("search",e),o&&a.append("specialization",o),s&&a.append("activeOnly","true");const t=a.toString();return u(`/doctors${t?"?"+t:""}`)},getDoctor(e){return u(`/doctors/${e}`)},createDoctor(e){return u("/doctors",{method:"POST",body:JSON.stringify(e)})},updateDoctor(e,o){return u(`/doctors/${e}`,{method:"PUT",body:JSON.stringify(o)})},getSpecializations(){return u("/doctors/specializations")},getDoctorAvailability(e){return u(`/doctors/${e}/availability`)},addDoctorAvailability(e,o){return u(`/doctors/${e}/availability`,{method:"POST",body:JSON.stringify(o)})},deleteDoctorAvailability(e){return u(`/doctors/availability/${e}`,{method:"DELETE"})},getDoctorRestPeriods(e){return u(`/doctors/${e}/rest-periods`)},addDoctorRestPeriod(e,o){return u(`/doctors/${e}/rest-periods`,{method:"POST",body:JSON.stringify(o)})},deleteDoctorRestPeriod(e){return u(`/doctors/rest-periods/${e}`,{method:"DELETE"})},getDoctorTimeline(e,o){return u(`/doctors/${e}/timeline?date=${o}`)},getDoctorWorkload(e){const o=e?`?date=${e}`:"";return u(`/doctors/workload${o}`)},getAppointments({date:e,doctorId:o,patientId:s,status:a}={}){const t=new URLSearchParams;e&&t.append("date",e),o&&t.append("doctorId",o),s&&t.append("patientId",s),a&&t.append("status",a);const n=t.toString();return u(`/appointments${n?"?"+n:""}`)},getAppointment(e){return u(`/appointments/${e}`)},bookAppointment(e){return u("/appointments",{method:"POST",body:JSON.stringify(e)})},rescheduleAppointment(e,o){return u(`/appointments/${e}/reschedule`,{method:"PUT",body:JSON.stringify(o)})},cancelAppointment(e,o){return u(`/appointments/${e}/cancel`,{method:"PUT",body:JSON.stringify({cancellationReason:o})})},updateAppointmentStatus(e,o,s=""){const a=new URLSearchParams({status:o});return s&&a.append("notes",s),u(`/appointments/${e}/status?${a.toString()}`,{method:"PATCH"})},checkInAppointment(e){return u(`/appointments/${e}/check-in`,{method:"PATCH"})},recommendSlot(e,o,s,a){const t=new URLSearchParams({doctorId:e,patientId:o,date:s});return a&&t.append("preferredStartTime",a),u(`/appointments/recommend?${t.toString()}`)},recommendWorkloadBalancedSlot(e,o,s,a){const t=new URLSearchParams({specialization:e,patientId:o,date:s});return a&&t.append("preferredStartTime",a),u(`/appointments/recommend/workload?${t.toString()}`)},getLiveQueue({date:e,doctorId:o}={}){const s=new URLSearchParams;e&&s.append("date",e),o&&s.append("doctorId",o);const a=s.toString();return u(`/appointments/queue${a?"?"+a:""}`)},getScheduleConflicts(e){const o=e?`?fromDate=${e}`:"";return u(`/appointments/conflicts${o}`)},previewSimulation(e){return u("/simulation/preview",{method:"POST",body:JSON.stringify(e)})},applySimulation(e){return u("/simulation/apply",{method:"POST",body:JSON.stringify(e)})},getWaitlist({status:e,date:o}={}){const s=new URLSearchParams;e&&s.append("status",e),o&&s.append("date",o);const a=s.toString();return u(`/waitlist${a?"?"+a:""}`)},addToWaitlist(e){return u("/waitlist",{method:"POST",body:JSON.stringify(e)})},acceptWaitlistOffer(e){return u(`/waitlist/${e}/accept`,{method:"POST"})},rejectWaitlistOffer(e){return u(`/waitlist/${e}/reject`,{method:"POST"})}};let v="dashboard",k=[],C=[],A=[];const g=document.getElementById("app"),T=document.getElementById("modal-container"),Z=document.getElementById("toast-container"),L={dashboard:document.getElementById("nav-dashboard"),appointments:document.getElementById("nav-appointments"),"smart-scheduling":document.getElementById("nav-smart-scheduling"),simulator:document.getElementById("nav-simulator"),queue:document.getElementById("nav-queue"),conflicts:document.getElementById("nav-conflicts"),patients:document.getElementById("nav-patients"),doctors:document.getElementById("nav-doctors")};function d(e,o="success"){const s=document.createElement("div"),a={success:"bg-emerald-600 text-white",error:"bg-rose-600 text-white",info:"bg-sky-600 text-white",warn:"bg-amber-600 text-white"},t={success:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>',error:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',info:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',warn:'<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>'};s.className=`${a[o]||a.info} p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all duration-300 pointer-events-auto transform translate-y-2 opacity-0 text-sm font-medium z-50`,s.innerHTML=`
    <span class="flex-shrink-0">${t[o]||t.info}</span>
    <span class="flex-1">${l(e)}</span>
    <button class="text-white/80 hover:text-white ml-2" onclick="this.parentElement.remove()">&times;</button>
  `,Z.appendChild(s),requestAnimationFrame(()=>{s.classList.remove("translate-y-2","opacity-0")}),setTimeout(()=>{s.classList.add("opacity-0","translate-y-2"),setTimeout(()=>s.remove(),300)},4500)}function h(e){var o;T.innerHTML=`
    <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-7 relative max-h-[90vh] overflow-y-auto animate-fade-in border border-slate-100">
      <button id="close-modal-btn" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      ${e}
    </div>
  `,T.classList.remove("hidden"),(o=document.getElementById("close-modal-btn"))==null||o.addEventListener("click",y)}function y(){T.classList.add("hidden"),T.innerHTML=""}T.addEventListener("click",e=>{e.target===T&&y()});function l(e){return e?String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}function M(e){const s={SCHEDULED:{bg:"bg-sky-50 text-sky-700 border-sky-200",label:"Scheduled"},CHECKED_IN:{bg:"bg-indigo-50 text-indigo-700 border-indigo-200",label:"Checked In"},COMPLETED:{bg:"bg-emerald-50 text-emerald-700 border-emerald-200",label:"Completed"},CANCELLED:{bg:"bg-rose-50 text-rose-700 border-rose-200",label:"Cancelled"},RESCHEDULED:{bg:"bg-amber-50 text-amber-700 border-amber-200",label:"Rescheduled"},NO_SHOW:{bg:"bg-slate-100 text-slate-700 border-slate-200",label:"No Show"},WAITING:{bg:"bg-blue-50 text-blue-700 border-blue-200",label:"Waiting"},OFFERED:{bg:"bg-purple-50 text-purple-700 border-purple-200 animate-pulse",label:"Slot Offered"},ACCEPTED:{bg:"bg-emerald-50 text-emerald-700 border-emerald-200",label:"Accepted"},EXPIRED:{bg:"bg-slate-100 text-slate-600 border-slate-200",label:"Expired"}}[e]||{bg:"bg-slate-100 text-slate-600 border-slate-200",label:e};return`<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${s.bg}">${s.label}</span>`}function O(e,o){if(!e)return"";const[s,a]=e.split(":").map(Number),t=s*60+a+o,n=Math.floor(t/60)%24,i=t%60;return`${String(n).padStart(2,"0")}:${String(i).padStart(2,"0")}`}function E(e){v=e,Object.keys(L).forEach(o=>{const s=L[o];s&&(o===e?s.className="nav-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-1.5 text-sky-700 bg-sky-50 border border-sky-200/60 shadow-xs whitespace-nowrap":s.className="nav-btn px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap")}),e==="dashboard"?D():e==="appointments"?S():e==="smart-scheduling"?ee():e==="simulator"?Q():e==="queue"?j():e==="conflicts"?se():e==="patients"?H():e==="doctors"&&_()}Object.keys(L).forEach(e=>{L[e]&&L[e].addEventListener("click",()=>E(e))});async function $(){try{const[e,o,s]=await Promise.all([p.getDoctors("","",!1),p.getPatients("",!1),p.getSpecializations()]);k=e||[],C=o||[],A=s||[]}catch(e){console.warn("Could not refresh lookups:",e)}}async function D(){var e,o,s;g.innerHTML=`
    <div class="flex items-center justify-center py-16">
      <div class="inline-flex items-center gap-3 text-slate-500 font-medium text-sm">
        <svg class="animate-spin h-5 w-5 text-sky-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
        Loading live dashboard statistics...
      </div>
    </div>
  `;try{const a=await p.getDashboardStats();await $(),g.innerHTML=`
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
                ${a.upcomingAppointments&&a.upcomingAppointments.length>0?a.upcomingAppointments.map(t=>{var n,i;return`
                  <tr class="hover:bg-slate-50/50 transition">
                    <td class="py-3.5 px-4 whitespace-nowrap">
                      <span class="font-medium text-slate-900">${t.appointmentDate}</span>
                      <span class="text-xs text-slate-500 block">${(n=t.startTime)==null?void 0:n.substring(0,5)} - ${(i=t.endTime)==null?void 0:i.substring(0,5)} (20m)</span>
                    </td>
                    <td class="py-3.5 px-4 font-medium text-slate-900">${l(t.patientName)}</td>
                    <td class="py-3.5 px-4 text-slate-700">${l(t.doctorName)}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">${l(t.doctorSpecialization)}</span>
                    </td>
                    <td class="py-3.5 px-4">${M(t.status)}</td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                      ${t.status==="SCHEDULED"||t.status==="RESCHEDULED"?`
                        <button onclick="window.handleCheckIn(${t.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Check In</button>
                      `:""}
                      <button onclick="window.handleRescheduleModal(${t.appointmentId}, '${t.appointmentDate}', '${t.startTime}', '${t.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                      <button onclick="window.handleCancelModal(${t.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                    </td>
                  </tr>
                `}).join(""):`
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
    `,(e=document.getElementById("quick-smart-btn"))==null||e.addEventListener("click",()=>E("smart-scheduling")),(o=document.getElementById("quick-book-btn"))==null||o.addEventListener("click",()=>K()),(s=document.getElementById("quick-patient-btn"))==null||s.addEventListener("click",()=>B())}catch(a){g.innerHTML=`
      <div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center max-w-lg mx-auto my-8">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 class="text-base font-bold text-rose-900">Failed to connect to Spring Boot backend</h3>
        <p class="text-xs text-rose-700 mt-1">${l(a.message)}</p>
        <button onclick="window.renderDashboard()" class="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-rose-700 transition">
          Retry Connection
        </button>
      </div>
    `}}async function H(e="",o=!1){g.innerHTML=`
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
          <input type="text" id="patient-search-input" value="${l(e)}" placeholder="Search by patient name, email, or phone number..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
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
  `,document.getElementById("add-patient-btn").addEventListener("click",()=>B());const s=document.getElementById("patient-search-input"),a=document.getElementById("patient-active-only");let t;s.addEventListener("input",n=>{clearTimeout(t),t=setTimeout(()=>{N(n.target.value,a.checked)},300)}),a.addEventListener("change",()=>{N(s.value,a.checked)}),N(e,o)}async function N(e,o){const s=document.getElementById("patients-table-container");if(s)try{const a=await p.getPatients(e,o);if(C=a,!a||a.length===0){s.innerHTML=`
        <div class="p-12 text-center">
          <p class="text-slate-500 font-medium text-sm">No patients found matching your search criteria.</p>
        </div>
      `;return}s.innerHTML=`
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
          ${a.map(t=>`
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${t.patientId}</td>
              <td class="py-3 px-4">
                <span class="font-semibold text-slate-900 block">${l(t.firstName)} ${l(t.lastName)}</span>
                <span class="text-xs text-slate-500">${l(t.address||"Address not specified")}</span>
              </td>
              <td class="py-3 px-4 text-xs">
                <div class="font-medium text-slate-800">${l(t.phone)}</div>
                <div class="text-slate-500">${l(t.email)}</div>
              </td>
              <td class="py-3 px-4 text-xs text-slate-700">
                <div>${t.dateOfBirth}</div>
                <div class="text-slate-500 font-medium">${t.gender}</div>
              </td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded text-xs font-bold ${t.bloodGroup?"bg-rose-50 text-rose-700 border border-rose-200/80":"text-slate-400"}">
                  ${t.bloodGroup||"N/A"}
                </span>
              </td>
              <td class="py-3 px-4">
                ${t.active?'<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>':'<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Deactivated</span>'}
              </td>
              <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                <button onclick="window.handleEditPatient(${t.patientId})" class="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Edit</button>
                ${t.active?`<button onclick="window.handleDeactivatePatient(${t.patientId}, '${l(t.firstName)} ${l(t.lastName)}')" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Deactivate</button>`:""}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `}catch(a){s.innerHTML=`<div class="p-6 text-center text-rose-600 text-sm">Failed to load patients: ${l(a.message)}</div>`}}function B(e=null){const o=!!e;h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">${o?"Update Patient Details":"Register New Patient"}</h3>
    <p class="text-xs text-slate-500 mb-4">Fill in the patient's personal and contact information below.</p>
    
    <form id="patient-form" class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
          <input type="text" name="firstName" required value="${l((e==null?void 0:e.firstName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Arun" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
          <input type="text" name="lastName" required value="${l((e==null?void 0:e.lastName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Kumar" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" name="email" required value="${l((e==null?void 0:e.email)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="arun@example.com" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" name="phone" required value="${l((e==null?void 0:e.phone)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="+91 9876543210" />
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
            ${["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(s=>`<option value="${s}" ${(e==null?void 0:e.bloodGroup)===s?"selected":""}>${s}</option>`).join("")}
          </select>
        </div>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
        <textarea name="address" rows="2" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="Street, City, Postal Code">${l((e==null?void 0:e.address)||"")}</textarea>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          ${o?"Save Changes":"Register Patient"}
        </button>
      </div>
    </form>
  `),document.getElementById("patient-form").addEventListener("submit",async s=>{s.preventDefault();const a=new FormData(s.target),t=Object.fromEntries(a.entries());try{o?(await p.updatePatient(e.patientId,t),d("Patient updated successfully")):(await p.createPatient(t),d("Patient registered successfully")),y(),H()}catch(n){d(n.message,"error")}})}async function _(e="",o=""){g.innerHTML=`
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
          <input type="text" id="doctor-search-input" value="${l(e)}" placeholder="Search doctor by name or email..." class="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
        </div>
        <div class="sm:w-64">
          <select id="doctor-spec-filter" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
            <option value="">All Specializations</option>
            ${A.map(n=>`<option value="${l(n)}" ${o===n?"selected":""}>${l(n)}</option>`).join("")}
          </select>
        </div>
      </div>

      <!-- Doctors Grid -->
      <div id="doctors-grid-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="col-span-full p-8 text-center text-slate-400">Loading doctors...</div>
      </div>
    </div>
  `,document.getElementById("add-doctor-btn").addEventListener("click",()=>F());const s=document.getElementById("doctor-search-input"),a=document.getElementById("doctor-spec-filter");let t;s.addEventListener("input",n=>{clearTimeout(t),t=setTimeout(()=>{R(n.target.value,a.value)},300)}),a.addEventListener("change",n=>{R(s.value,n.target.value)}),R(e,o)}async function R(e,o){const s=document.getElementById("doctors-grid-container");if(s)try{const a=await p.getDoctors(e,o);if(k=a,!a||a.length===0){s.innerHTML='<div class="col-span-full p-12 text-center text-slate-400 font-medium">No doctors found matching your filter criteria.</div>';return}s.innerHTML=a.map(t=>`
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
        <div>
          <div class="flex items-start justify-between gap-3">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                ${l(t.specialization)}
              </span>
              <h3 class="text-base font-bold text-slate-900 mt-2">Dr. ${l(t.firstName)} ${l(t.lastName)}</h3>
            </div>
            <span class="text-xs font-mono text-slate-400">#${t.doctorId}</span>
          </div>

          <div class="mt-3 space-y-1 text-xs text-slate-600">
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              ${l(t.email)}
            </p>
            <p class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              ${l(t.phone)}
            </p>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs flex-wrap gap-2">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-bold">Consultation</span>
            <span class="font-bold text-slate-900 text-sm">₹${Number(t.consultationFee).toFixed(2)}</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button onclick="window.handleViewTimeline(${t.doctorId}, 'Dr. ${l(t.firstName)} ${l(t.lastName)}')" class="px-2 py-1 font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition" title="View 20-min slot timeline">
              Timeline
            </button>
            <button onclick="window.handleManageRestPeriods(${t.doctorId}, 'Dr. ${l(t.firstName)} ${l(t.lastName)}')" class="px-2 py-1 font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition" title="Protected rest periods">
              Rest Breaks
            </button>
            <button onclick="window.handleManageAvailability(${t.doctorId}, 'Dr. ${l(t.firstName)} ${l(t.lastName)}')" class="px-2 py-1 font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">
              Shifts
            </button>
            <button onclick="window.handleEditDoctor(${t.doctorId})" class="px-2 py-1 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
              Edit
            </button>
          </div>
        </div>
      </div>
    `).join("")}catch(a){s.innerHTML=`<div class="col-span-full p-6 text-center text-rose-600 text-sm">Failed to load doctors: ${l(a.message)}</div>`}}function F(e=null){const o=!!e;h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">${o?"Update Doctor Details":"Add New Medical Specialist"}</h3>
    <p class="text-xs text-slate-500 mb-4">Enter doctor profile, specialization, and fee.</p>

    <form id="doctor-form" class="space-y-3.5">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
          <input type="text" name="firstName" required value="${l((e==null?void 0:e.firstName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Meena" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
          <input type="text" name="lastName" required value="${l((e==null?void 0:e.lastName)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Raj" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
          <input type="text" name="specialization" required value="${l((e==null?void 0:e.specialization)||"")}" list="spec-suggestions" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="e.g. Cardiology" />
          <datalist id="spec-suggestions">
            ${A.map(s=>`<option value="${l(s)}"></option>`).join("")}
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
          <input type="email" name="email" required value="${l((e==null?void 0:e.email)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="meena@hospital.org" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input type="tel" name="phone" required value="${l((e==null?void 0:e.phone)||"")}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" placeholder="+91 9876500001" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">
          ${o?"Save Changes":"Add Doctor"}
        </button>
      </div>
    </form>
  `),document.getElementById("doctor-form").addEventListener("submit",async s=>{s.preventDefault();const a=new FormData(s.target),t=Object.fromEntries(a.entries());try{o?(await p.updateDoctor(e.doctorId,t),d("Doctor profile updated successfully")):(await p.createDoctor(t),d("Doctor registered successfully")),y(),await $(),_()}catch(n){d(n.message,"error")}})}async function J(e,o){var a;h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Manage Shift Availability — ${l(o)}</h3>
    <p class="text-xs text-slate-500 mb-4">Add or view working shift hours for this doctor.</p>

    <!-- Add Availability Slot Form -->
    <form id="add-availability-form" class="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 mb-4">
      <h4 class="text-xs font-bold uppercase text-slate-700 tracking-wider">Add Scheduled Shift</h4>
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
  `);const s=async()=>{const t=document.getElementById("availability-slots-list");if(t)try{const n=await p.getDoctorAvailability(e);if(!n||n.length===0){t.innerHTML='<p class="text-xs text-slate-400 text-center py-4">No scheduled availability configured for this doctor (standard 09:00 - 17:00 outpatient hours apply).</p>';return}t.innerHTML=n.map(i=>{var c,m;return`
        <div class="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white text-xs">
          <div>
            <span class="font-bold text-slate-800">${i.availableDate}</span>
            <span class="text-slate-500 ml-2 font-mono">${(c=i.startTime)==null?void 0:c.substring(0,5)} - ${(m=i.endTime)==null?void 0:m.substring(0,5)}</span>
          </div>
          <button onclick="window.handleDeleteAvailability(${i.availabilityId}, ${e}, '${l(o)}')" class="text-rose-600 hover:text-rose-800 font-medium">
            Delete
          </button>
        </div>
      `}).join("")}catch(n){t.innerHTML=`<p class="text-xs text-rose-600 text-center py-2">${l(n.message)}</p>`}};(a=document.getElementById("add-availability-form"))==null||a.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(t.target),i={doctorId:e,availableDate:n.get("availableDate"),startTime:n.get("startTime")+":00",endTime:n.get("endTime")+":00"};try{await p.addDoctorAvailability(e,i),d("Availability shift added"),s()}catch(c){d(c.message,"error")}}),s()}async function G(e,o){var a;h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Protected Rest Periods — ${l(o)}</h3>
    <p class="text-xs text-slate-500 mb-4">Protected rest periods are non-bypassable breaks (rounds, meetings, lunch) enforced strictly by the backend.</p>

    <form id="add-rest-period-form" class="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 space-y-3 mb-4">
      <h4 class="text-xs font-bold uppercase text-amber-800 tracking-wider">Configure Rest Break</h4>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <label class="block text-[10px] font-semibold text-slate-600 mb-1">Date *</label>
          <input type="date" name="restDate" required value="${new Date(Date.now()+864e5).toISOString().split("T")[0]}" class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
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
  `);const s=async()=>{const t=document.getElementById("rest-periods-list");if(t)try{const n=await p.getDoctorRestPeriods(e);if(!n||n.length===0){t.innerHTML='<p class="text-xs text-slate-400 text-center py-4">No custom rest periods configured. Default hospital lunch window (13:00 - 14:00) is automatically guarded.</p>';return}t.innerHTML=n.map(i=>{var c,m;return`
        <div class="flex items-center justify-between p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 text-xs">
          <div>
            <div class="font-bold text-slate-800 flex items-center gap-2">
              <span>${i.restDate}</span>
              <span class="font-mono text-amber-800">${(c=i.startTime)==null?void 0:c.substring(0,5)} - ${(m=i.endTime)==null?void 0:m.substring(0,5)}</span>
            </div>
            <p class="text-[11px] text-slate-500 mt-0.5">${l(i.reason)}</p>
          </div>
          <button onclick="window.handleDeleteRestPeriod(${i.restId}, ${e}, '${l(o)}')" class="text-rose-600 hover:text-rose-800 font-medium">
            Remove
          </button>
        </div>
      `}).join("")}catch(n){t.innerHTML=`<p class="text-xs text-rose-600 text-center py-2">${l(n.message)}</p>`}};(a=document.getElementById("add-rest-period-form"))==null||a.addEventListener("submit",async t=>{t.preventDefault();const n=new FormData(t.target),i={doctorId:e,restDate:n.get("restDate"),startTime:n.get("startTime")+":00",endTime:n.get("endTime")+":00",reason:n.get("reason")};try{await p.addDoctorRestPeriod(e,i),d("Protected rest period created"),s()}catch(c){d(c.message,"error")}}),s()}async function Y(e,o){var t;const s=new Date(Date.now()+864e5).toISOString().split("T")[0];h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Schedule Timeline — ${l(o)}</h3>
    <p class="text-xs text-slate-500 mb-4">Fixed 20-minute slot visualization showing bookings, rest intervals, and available slots.</p>

    <div class="flex items-center gap-3 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
      <label class="text-xs font-semibold text-slate-700">Select Date:</label>
      <input type="date" id="timeline-date-picker" value="${s}" class="px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
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
  `);const a=async n=>{const i=document.getElementById("timeline-slots-grid");if(i)try{const c=await p.getDoctorTimeline(e,n);if(!c||!c.slots||c.slots.length===0){i.innerHTML=`<p class="col-span-full text-center text-xs text-slate-400 py-6">No slot data available for ${n}.</p>`;return}i.innerHTML=c.slots.map(m=>{var w,I;let x="bg-slate-100 text-slate-500 border-slate-200",f=m.label;return m.slotType==="AVAILABLE"?x="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 cursor-pointer":m.slotType==="BOOKED"?x="bg-sky-50 text-sky-800 border-sky-200":m.slotType==="REST_PERIOD"&&(x="bg-amber-50 text-amber-800 border-amber-200"),`
          <div class="p-2 rounded-lg border text-xs flex flex-col justify-between ${x} transition" title="${l(m.reason||m.label)}">
            <span class="font-mono font-bold">${(w=m.startTime)==null?void 0:w.substring(0,5)} - ${(I=m.endTime)==null?void 0:I.substring(0,5)}</span>
            <span class="text-[10px] mt-1 truncate">${l(f)}</span>
          </div>
        `}).join("")}catch(c){i.innerHTML=`<p class="col-span-full text-center text-xs text-rose-600 py-4">${l(c.message)}</p>`}};(t=document.getElementById("refresh-timeline-btn"))==null||t.addEventListener("click",()=>{const n=document.getElementById("timeline-date-picker").value;a(n)}),a(s)}async function S(e={}){await $(),g.innerHTML=`
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
          <input type="date" id="appt-date-filter" value="${e.date||""}" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Doctor</label>
          <select id="appt-doctor-filter" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
            <option value="">All Doctors</option>
            ${k.map(n=>`<option value="${n.doctorId}" ${e.doctorId==n.doctorId?"selected":""}>Dr. ${l(n.firstName)} ${l(n.lastName)} (${l(n.specialization)})</option>`).join("")}
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Filter by Status</label>
          <select id="appt-status-filter" class="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
            <option value="">All Statuses</option>
            <option value="SCHEDULED" ${e.status==="SCHEDULED"?"selected":""}>Scheduled</option>
            <option value="CHECKED_IN" ${e.status==="CHECKED_IN"?"selected":""}>Checked In</option>
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
  `,document.getElementById("book-appt-btn").addEventListener("click",()=>K());const o=document.getElementById("appt-date-filter"),s=document.getElementById("appt-doctor-filter"),a=document.getElementById("appt-status-filter"),t=()=>{U({date:o.value,doctorId:s.value,status:a.value})};o.addEventListener("change",t),s.addEventListener("change",t),a.addEventListener("change",t),U(e)}async function U(e){const o=document.getElementById("appointments-table-container");if(o)try{const s=await p.getAppointments(e);if(!s||s.length===0){o.innerHTML=`
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
          ${s.map(a=>{var t,n,i;return`
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${a.appointmentId}</td>
              <td class="py-3 px-4 whitespace-nowrap">
                <span class="font-semibold text-slate-900 block">${a.appointmentDate}</span>
                <span class="text-xs font-mono text-slate-500">${(t=a.startTime)==null?void 0:t.substring(0,5)} - ${(n=a.endTime)==null?void 0:n.substring(0,5)} (20m)</span>
                ${a.checkInTime?`<span class="text-[10px] text-indigo-600 font-medium block">Checked-In @ ${(i=a.checkInTime.split("T")[1])==null?void 0:i.substring(0,5)}</span>`:""}
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-slate-900 block">${l(a.patientName)}</span>
                <span class="text-xs text-slate-500">${l(a.patientPhone)}</span>
              </td>
              <td class="py-3 px-4">
                <span class="font-medium text-slate-900 block">${l(a.doctorName)}</span>
                <span class="text-xs text-sky-600 font-medium">${l(a.doctorSpecialization)}</span>
              </td>
              <td class="py-3 px-4 max-w-xs text-xs">
                <p class="text-slate-800 font-medium truncate">${l(a.reasonForVisit||"General Visit")}</p>
                ${a.notes?`<p class="text-slate-500 truncate mt-0.5">Note: ${l(a.notes)}</p>`:""}
                ${a.cancellationReason?`<p class="text-rose-600 font-medium truncate mt-0.5">Cancelled: ${l(a.cancellationReason)}</p>`:""}
              </td>
              <td class="py-3 px-4">${M(a.status)}</td>
              <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                ${a.status==="SCHEDULED"||a.status==="RESCHEDULED"?`
                  <button onclick="window.handleCheckIn(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition">Check In</button>
                  <button onclick="window.handleStatusUpdate(${a.appointmentId}, 'COMPLETED')" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Complete</button>
                  <button onclick="window.handleRescheduleModal(${a.appointmentId}, '${a.appointmentDate}', '${a.startTime}', '${a.endTime}')" class="px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition">Reschedule</button>
                  <button onclick="window.handleCancelModal(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                `:a.status==="CHECKED_IN"?`
                  <button onclick="window.handleStatusUpdate(${a.appointmentId}, 'COMPLETED')" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Complete Visit</button>
                  <button onclick="window.handleCancelModal(${a.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">Cancel</button>
                `:`
                  <span class="text-xs text-slate-400 italic">Historical</span>
                `}
              </td>
            </tr>
          `}).join("")}
        </tbody>
      </table>
    `}catch(s){o.innerHTML=`<div class="p-6 text-center text-rose-600 text-sm">Failed to load appointments: ${l(s.message)}</div>`}}function K(){const e=C.filter(n=>n.active),o=k.filter(n=>n.active);if(e.length===0){d("Please register at least one active patient first.","info"),B();return}if(o.length===0){d("Please register at least one active doctor first.","info"),F();return}const s=new Date(Date.now()+864e5).toISOString().split("T")[0];h(`
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
          ${e.map(n=>`<option value="${n.patientId}">${l(n.firstName)} ${l(n.lastName)} (${l(n.phone)})</option>`).join("")}
        </select>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Select Doctor *</label>
        <select name="doctorId" id="book-doctor-select" required class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500">
          ${o.map(n=>`<option value="${n.doctorId}">Dr. ${l(n.firstName)} ${l(n.lastName)} — ${l(n.specialization)} (₹${n.consultationFee})</option>`).join("")}
        </select>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
          <input type="date" name="appointmentDate" required value="${s}" min="${new Date().toISOString().split("T")[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500" />
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
  `);const a=document.getElementById("book-start-time"),t=document.getElementById("book-end-time");a.addEventListener("input",()=>{t.value=O(a.value,20)}),document.getElementById("book-appt-form").addEventListener("submit",async n=>{n.preventDefault();const i=new FormData(n.target),c={patientId:Number(i.get("patientId")),doctorId:Number(i.get("doctorId")),appointmentDate:i.get("appointmentDate"),startTime:i.get("startTime")+":00",endTime:i.get("endTime")+":00",reasonForVisit:i.get("reasonForVisit"),notes:i.get("notes")};try{await p.bookAppointment(c),d("20-Minute appointment booked successfully!"),y(),v==="dashboard"?D():S()}catch(m){d(m.message,"error")}})}async function ee(){await $();const e=new Date(Date.now()+864e5).toISOString().split("T")[0];g.innerHTML=`
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
              ${C.filter(t=>t.active).map(t=>`<option value="${t.patientId}">${l(t.firstName)} ${l(t.lastName)}</option>`).join("")}
            </select>
          </div>

          <div id="doctor-picker-col">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Doctor *</label>
            <select name="doctorId" id="rec-doctor-select" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
              ${k.filter(t=>t.active).map(t=>`<option value="${t.doctorId}">Dr. ${l(t.firstName)} ${l(t.lastName)} (${l(t.specialization)})</option>`).join("")}
            </select>
          </div>

          <div id="spec-picker-col" class="hidden">
            <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization *</label>
            <select name="specialization" id="rec-spec-select" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500">
              ${A.map(t=>`<option value="${l(t)}">${l(t)}</option>`).join("")}
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
            <input type="date" name="date" required value="${e}" min="${new Date().toISOString().split("T")[0]}" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500" />
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
  `;const o=document.querySelectorAll('input[name="recommendMode"]'),s=document.getElementById("doctor-picker-col"),a=document.getElementById("spec-picker-col");o.forEach(t=>{t.addEventListener("change",n=>{n.target.value==="workload"?(s.classList.add("hidden"),a.classList.remove("hidden")):(s.classList.remove("hidden"),a.classList.add("hidden"))})}),document.getElementById("recommend-form").addEventListener("submit",async t=>{var w,I,q;t.preventDefault();const n=new FormData(t.target),i=document.querySelector('input[name="recommendMode"]:checked').value,c=Number(n.get("patientId")),m=n.get("date"),x=n.get("preferredStartTime")?n.get("preferredStartTime")+":00":null,f=document.getElementById("recommendation-result");f.classList.remove("hidden"),f.innerHTML='<div class="p-8 text-center text-slate-400">Evaluating slots and workload metrics...</div>';try{let r;if(i==="workload"){const b=n.get("specialization");r=await p.recommendWorkloadBalancedSlot(b,c,m,x)}else{const b=Number(n.get("doctorId"));r=await p.recommendSlot(b,c,m,x)}if(!r||!r.recommendedStart){f.innerHTML=`
          <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <h3 class="text-base font-bold text-amber-900">No Suitable 20-Minute Slot Found</h3>
            <p class="text-xs text-amber-800 mt-1">${l((r==null?void 0:r.explanation)||"All candidate slots are either fully booked or inside protected rest periods.")}</p>
            ${r&&r.rejectedReasons&&r.rejectedReasons.length>0?`
              <div class="mt-4 text-left max-w-md mx-auto bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700">
                <span class="font-bold block mb-1">Audit of Rejection Reasons:</span>
                <ul class="list-disc pl-4 space-y-0.5">
                  ${r.rejectedReasons.map(b=>`<li>${l(b)}</li>`).join("")}
                </ul>
              </div>
            `:""}
          </div>
        `;return}f.innerHTML=`
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Optimal 20-Min Slot Identified
              </span>
              <h3 class="text-xl font-bold text-slate-900 mt-1">${l(r.doctorName)}</h3>
              <p class="text-xs text-slate-500">${l(r.specialization)} &bull; Date: ${r.appointmentDate}</p>
            </div>
            <div class="text-right sm:text-right">
              <span class="text-xs text-slate-400 block uppercase font-bold">Recommended Slot</span>
              <span class="text-2xl font-black text-emerald-600 font-mono">${(w=r.recommendedStart)==null?void 0:w.substring(0,5)} - ${(I=r.recommendedEnd)==null?void 0:I.substring(0,5)}</span>
              <span class="text-[10px] text-slate-400 block">Duration: Exactly 20 Minutes</span>
            </div>
          </div>

          <!-- Doctor Workload Badge -->
          ${r.workload?`
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span class="font-bold text-slate-700 block">Doctor Workload Status</span>
                <span class="text-slate-500">${r.workload.scheduledAppointmentsCount} appointment(s) scheduled (${r.workload.scheduledMinutes} consultation minutes)</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${r.workload.scheduledAppointmentsCount<=2?"bg-emerald-100 text-emerald-800":"bg-amber-100 text-amber-800"}">
                ${r.workload.scheduledAppointmentsCount<=2?"Light Load (Optimal)":"Moderate Load"}
              </span>
            </div>
          `:""}

          <!-- Explainable Decision -->
          <div class="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950">
            <span class="font-bold block mb-1 flex items-center gap-1.5 text-indigo-900">
              <svg class="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Why This Slot Was Chosen (Explainable Engine Decision):
            </span>
            <p>${l(r.explanation)}</p>
          </div>

          <!-- Ranking Factors -->
          ${r.rankingFactors&&r.rankingFactors.length>0?`
            <div>
              <span class="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-2">Evaluated Ranking Factors:</span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                ${r.rankingFactors.map(b=>`
                  <div class="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700">
                    <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                    <span>${l(b)}</span>
                  </div>
                `).join("")}
              </div>
            </div>
          `:""}

          <!-- Audit of Rejected Slots -->
          ${r.rejectedReasons&&r.rejectedReasons.length>0?`
            <details class="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 cursor-pointer">
              <summary class="font-bold text-slate-700">Audit of Inspected & Rejected Slots (${r.rejectedReasons.length})</summary>
              <ul class="list-disc pl-5 mt-2 space-y-1 text-slate-500">
                ${r.rejectedReasons.map(b=>`<li>${l(b)}</li>`).join("")}
              </ul>
            </details>
          `:""}

          <!-- Alternative Slots -->
          ${r.alternativeSlots&&r.alternativeSlots.length>0?`
            <div>
              <span class="text-xs font-bold uppercase text-slate-600 tracking-wider block mb-2">Alternative 20-Min Slots:</span>
              <div class="flex items-center gap-2 flex-wrap">
                ${r.alternativeSlots.map(b=>{var z,W;return`
                  <button type="button" onclick="window.quickBookSlot(${r.doctorId}, ${r.patientId}, '${r.appointmentDate}', '${b.startTime}', '${b.endTime}')" class="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-mono font-medium text-slate-800 transition">
                    ${(z=b.startTime)==null?void 0:z.substring(0,5)} - ${(W=b.endTime)==null?void 0:W.substring(0,5)}
                  </button>
                `}).join("")}
              </div>
            </div>
          `:""}

          <!-- Action -->
          <div class="flex justify-end pt-3 border-t border-slate-100">
            <button id="confirm-rec-booking-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              Confirm & Book This Recommended Slot
            </button>
          </div>
        </div>
      `,(q=document.getElementById("confirm-rec-booking-btn"))==null||q.addEventListener("click",async()=>{try{await p.bookAppointment({patientId:r.patientId,doctorId:r.doctorId,appointmentDate:r.appointmentDate,startTime:r.recommendedStart+(r.recommendedStart.length===5?":00":""),endTime:r.recommendedEnd+(r.recommendedEnd.length===5?":00":""),reasonForVisit:"Booked via Intelligent Recommendation Engine",notes:"Verified 20-min slot with rest protection and workload balancing."}),d("Recommended 20-minute appointment confirmed and booked!"),E("appointments")}catch(b){d(b.message,"error")}})}catch(r){f.innerHTML=`<div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-xs text-rose-700">${l(r.message)}</div>`}})}window.quickBookSlot=async(e,o,s,a,t)=>{try{await p.bookAppointment({doctorId:e,patientId:o,appointmentDate:s,startTime:a+(a.length===5?":00":""),endTime:t+(t.length===5?":00":""),reasonForVisit:"Selected alternative slot from Recommendation Engine"}),d("Alternative 20-minute appointment booked successfully!"),E("appointments")}catch(n){d(n.message,"error")}};async function Q(){await $();const e=new Date(Date.now()+864e5).toISOString().split("T")[0];g.innerHTML=`
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
                ${k.filter(o=>o.active).map(o=>`<option value="${o.doctorId}">Dr. ${l(o.firstName)} ${l(o.lastName)} (${l(o.specialization)})</option>`).join("")}
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Simulation Date *</label>
              <input type="date" name="simulationDate" required value="${e}" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500" />
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
  `,document.getElementById("simulator-form").addEventListener("submit",async o=>{var n;o.preventDefault();const s=new FormData(o.target),a={doctorId:Number(s.get("doctorId")),simulationDate:s.get("simulationDate"),simulationType:s.get("simulationType"),startTime:s.get("startTime")+":00",endTime:s.get("endTime")+":00",description:s.get("description")||"Digital Twin Test Scenario"},t=document.getElementById("simulation-output");t.classList.remove("hidden"),t.innerHTML='<div class="p-8 text-center text-slate-400">Simulating schedule alterations in-memory...</div>';try{const i=await p.previewSimulation(a),c={SAFE:{bg:"bg-emerald-100 text-emerald-800 border-emerald-300",text:"SAFE — Zero Appointment Conflicts"},CAUTION:{bg:"bg-amber-100 text-amber-800 border-amber-300",text:"CAUTION — Collides with Active Bookings"},HIGH_CONFLICT:{bg:"bg-rose-100 text-rose-800 border-rose-300",text:"HIGH CONFLICT — Severe Disruption"}},m=c[i.riskLevel]||c.SAFE;t.innerHTML=`
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${m.bg}">
                Risk Level: ${m.text}
              </span>
              <h3 class="text-xl font-bold text-slate-900 mt-1">${l(i.scenarioDescription)}</h3>
              <p class="text-xs text-slate-500">${l(i.doctorName)} &bull; ${i.simulationDate}</p>
            </div>
            <div class="flex items-center gap-4 text-center">
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Baseline Slots</span>
                <span class="text-lg font-bold text-slate-800">${i.validSlotsBefore}</span>
              </div>
              <div class="text-slate-400 font-bold">&rarr;</div>
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Projected Slots</span>
                <span class="text-lg font-bold text-indigo-700">${i.validSlotsAfter}</span>
              </div>
              <div class="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Capacity Delta</span>
                <span class="text-lg font-bold ${i.slotDelta<0?"text-rose-600":"text-emerald-600"}">${i.slotDelta>0?"+":""}${i.slotDelta} slots</span>
              </div>
            </div>
          </div>

          <!-- Explanation -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
            <span class="font-bold text-slate-900 block mb-1">Simulator Analysis Summary:</span>
            <p>${l(i.explanation)}</p>
          </div>

          <!-- Conflicted Appointments -->
          ${i.conflictingAppointments&&i.conflictingAppointments.length>0?`
            <div class="space-y-2">
              <span class="text-xs font-bold uppercase text-rose-700 tracking-wider block">
                Impacted Active Appointments (${i.conflictingAppointments.length}):
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
                    ${i.conflictingAppointments.map(x=>{var f,w;return`
                      <tr>
                        <td class="py-2 px-3 font-mono">#${x.appointmentId}</td>
                        <td class="py-2 px-3 font-medium">${l(x.patientName)}</td>
                        <td class="py-2 px-3 font-mono">${(f=x.startTime)==null?void 0:f.substring(0,5)} - ${(w=x.endTime)==null?void 0:w.substring(0,5)}</td>
                        <td class="py-2 px-3 text-rose-700 font-medium">${l(x.impactReason)}</td>
                      </tr>
                    `}).join("")}
                  </tbody>
                </table>
              </div>
            </div>
          `:`
            <div class="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Zero schedule collisions. The simulated change is entirely safe to introduce into the doctor's live schedule.</span>
            </div>
          `}

          <!-- Apply Button (Only if SAFE and ADD_EXTRA_REST_PERIOD) -->
          ${i.canApplySafely&&a.simulationType==="ADD_EXTRA_REST_PERIOD"?`
            <div class="flex justify-end pt-3 border-t border-slate-100">
              <button id="apply-sim-btn" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Apply Rest Period to Doctor Schedule
              </button>
            </div>
          `:""}
        </div>
      `,(n=document.getElementById("apply-sim-btn"))==null||n.addEventListener("click",async()=>{try{await p.applySimulation(a),d("Simulated rest break applied to doctor schedule successfully!"),Q()}catch(x){d(x.message,"error")}})}catch(i){t.innerHTML=`<div class="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-xs text-rose-700">${l(i.message)}</div>`}})}async function j(){await $();const e=new Date().toISOString().split("T")[0];g.innerHTML=`
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
            <input type="date" id="queue-date" value="${e}" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none" />
            <select id="queue-doctor" class="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none">
              <option value="">All Doctors</option>
              ${k.filter(t=>t.active).map(t=>`<option value="${t.doctorId}">Dr. ${l(t.firstName)} ${l(t.lastName)}</option>`).join("")}
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
  `,document.getElementById("join-waitlist-btn").addEventListener("click",()=>te());const o=document.getElementById("queue-date"),s=document.getElementById("queue-doctor"),a=()=>{V(o.value,s.value)};o.addEventListener("change",a),s.addEventListener("change",a),V(e,""),P()}async function V(e,o){const s=document.getElementById("queue-table-container");if(s)try{const a=await p.getLiveQueue({date:e,doctorId:o||null});if(!a||a.length===0){s.innerHTML=`<div class="p-8 text-center text-slate-400 text-xs">No outpatient appointments found in queue for ${e}.</div>`;return}s.innerHTML=`
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
          ${a.map(t=>{var n,i;return`
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-bold text-slate-900 font-mono text-base">#${t.queuePosition}</td>
              <td class="py-3 px-4 font-semibold text-slate-900">${l(t.patientName)}</td>
              <td class="py-3 px-4 text-slate-700">${l(t.doctorName)}</td>
              <td class="py-3 px-4 font-mono text-xs text-slate-600">${(n=t.scheduledStartTime)==null?void 0:n.substring(0,5)} - ${(i=t.scheduledEndTime)==null?void 0:i.substring(0,5)}</td>
              <td class="py-3 px-4">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${t.estimatedWaitMinutes===0?"bg-emerald-50 text-emerald-800 border border-emerald-200":"bg-slate-100 text-slate-700"}">
                  ${t.estimatedWaitMinutes===0?"Next in line (0m)":`~${t.estimatedWaitMinutes} mins`}
                </span>
              </td>
              <td class="py-3 px-4">${M(t.status)}</td>
              <td class="py-3 px-4 text-right">
                ${t.status!=="CHECKED_IN"?`
                  <button onclick="window.handleCheckIn(${t.appointmentId})" class="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition">Check In</button>
                `:`
                  <span class="text-xs text-emerald-600 font-medium">Checked In</span>
                `}
              </td>
            </tr>
          `}).join("")}
        </tbody>
      </table>
    `}catch(a){s.innerHTML=`<div class="p-6 text-center text-rose-600 text-xs">${l(a.message)}</div>`}}async function P(){const e=document.getElementById("waitlist-table-container");if(e)try{const o=await p.getWaitlist();if(!o||o.length===0){e.innerHTML='<div class="p-8 text-center text-slate-400 text-xs">Waitlist is currently empty. Click "Join Waitlist" above to register a patient.</div>';return}e.innerHTML=`
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
          ${o.map(s=>{var a,t,n;return`
            <tr class="hover:bg-slate-50/50 transition">
              <td class="py-3 px-4 font-mono text-xs text-slate-500">#${s.waitlistId}</td>
              <td class="py-3 px-4 font-semibold text-slate-900">${l(s.patientName)}</td>
              <td class="py-3 px-4 text-xs">
                <span class="font-medium text-slate-800 block">${l(s.specialization||"Any")}</span>
                <span class="text-slate-500">${l(s.doctorName||"Any doctor in specialty")}</span>
              </td>
              <td class="py-3 px-4 text-xs font-mono text-slate-700">
                <span class="block">${s.preferredDate}</span>
                <span class="text-slate-500 text-[11px]">${s.preferredStartTime?`${s.preferredStartTime.substring(0,5)} - ${(a=s.preferredEndTime)==null?void 0:a.substring(0,5)}`:"Any time of day"}</span>
              </td>
              <td class="py-3 px-4 text-xs">
                ${s.offeredAppointmentDate?`
                  <div class="bg-purple-50 p-2 rounded-lg border border-purple-200">
                    <span class="font-bold text-purple-900 block">${s.offeredDoctorName}</span>
                    <span class="font-mono text-purple-800 block">${s.offeredAppointmentDate} (${(t=s.offeredStartTime)==null?void 0:t.substring(0,5)} - ${(n=s.offeredEndTime)==null?void 0:n.substring(0,5)})</span>
                    ${s.offerExpiresAt?`<span class="text-[10px] text-purple-600 block">Expires: ${s.offerExpiresAt.replace("T"," ").substring(0,16)}</span>`:""}
                  </div>
                `:'<span class="text-slate-400 italic">Awaiting cancellation</span>'}
              </td>
              <td class="py-3 px-4">${M(s.status)}</td>
              <td class="py-3 px-4 text-right whitespace-nowrap space-x-1">
                ${s.status==="OFFERED"?`
                  <button onclick="window.handleAcceptWaitlist(${s.waitlistId})" class="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition">
                    Accept & Book
                  </button>
                  <button onclick="window.handleRejectWaitlist(${s.waitlistId})" class="px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition">
                    Pass to Next
                  </button>
                `:`
                  <span class="text-xs text-slate-400 italic">No action</span>
                `}
              </td>
            </tr>
          `}).join("")}
        </tbody>
      </table>
    `}catch(o){e.innerHTML=`<div class="p-6 text-center text-rose-600 text-xs">${l(o.message)}</div>`}}function te(){const e=C.filter(s=>s.active),o=new Date(Date.now()+864e5).toISOString().split("T")[0];h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Join Cancellation Waitlist</h3>
    <p class="text-xs text-slate-500 mb-4">When a matching slot is cancelled by another patient, the engine automatically offers it to you in FIFO order.</p>

    <form id="join-waitlist-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">Patient *</label>
        <select name="patientId" required class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
          ${e.map(s=>`<option value="${s.patientId}">${l(s.firstName)} ${l(s.lastName)}</option>`).join("")}
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Preferred Doctor (Optional)</label>
          <select name="doctorId" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="">Any Available Doctor in Specialty</option>
            ${k.filter(s=>s.active).map(s=>`<option value="${s.doctorId}">Dr. ${l(s.firstName)} ${l(s.lastName)} (${l(s.specialization)})</option>`).join("")}
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Specialization</label>
          <select name="specialization" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500">
            <option value="">Any Specialization</option>
            ${A.map(s=>`<option value="${l(s)}">${l(s)}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Preferred Date *</label>
          <input type="date" name="preferredDate" required value="${o}" min="${new Date().toISOString().split("T")[0]}" class="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500" />
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
  `),document.getElementById("join-waitlist-form").addEventListener("submit",async s=>{s.preventDefault();const a=new FormData(s.target),t={patientId:Number(a.get("patientId")),doctorId:a.get("doctorId")?Number(a.get("doctorId")):null,specialization:a.get("specialization")||null,preferredDate:a.get("preferredDate"),preferredStartTime:a.get("preferredStartTime")?a.get("preferredStartTime")+":00":null,preferredEndTime:a.get("preferredEndTime")?a.get("preferredEndTime")+":00":null,notes:a.get("notes")};try{await p.addToWaitlist(t),d("Patient added to cancellation waitlist successfully"),y(),P()}catch(n){d(n.message,"error")}})}window.handleAcceptWaitlist=async e=>{try{await p.acceptWaitlistOffer(e),d("Waitlist offer accepted! Appointment officially booked."),P()}catch(o){d(o.message,"error")}};window.handleRejectWaitlist=async e=>{try{await p.rejectWaitlistOffer(e),d("Offer declined. The slot will now cascade to the next eligible patient.","info"),P()}catch(o){d(o.message,"error")}};async function se(){var s;const e=new Date().toISOString().split("T")[0];g.innerHTML=`
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
          <input type="date" id="scan-from-date" value="${e}" class="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none" />
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
  `;const o=async a=>{const t=document.getElementById("conflicts-output");if(t){t.innerHTML='<div class="p-12 text-center text-slate-400">Running full-spectrum schedule collision scan...</div>';try{const n=await p.getScheduleConflicts(a),i=n.systemIntegrityStatus==="HEALTHY"&&n.totalConflicts===0;t.innerHTML=`
        <div class="space-y-5">
          <!-- Status Banner -->
          <div class="p-5 rounded-2xl border ${i?"bg-emerald-50 border-emerald-200 text-emerald-900":"bg-rose-50 border-rose-200 text-rose-900"} flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl ${i?"bg-emerald-600":"bg-rose-600"} text-white flex items-center justify-center font-bold">
                ${i?"✓":"!"}
              </span>
              <div>
                <h3 class="text-base font-bold">${i?"Schedule Integrity Verified: 100% Conflict-Free":"Schedule Attention Required"}</h3>
                <p class="text-xs ${i?"text-emerald-700":"text-rose-700"} mt-0.5">
                  ${i?"All active appointments strictly honor doctor availability, 20-minute slot boundaries, and protected rest intervals.":`Detected ${n.totalConflicts} potential schedule conflict(s) that violate clinical boundary rules.`}
                </p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-bold ${i?"bg-emerald-100 text-emerald-800":"bg-rose-100 text-rose-800"}">
              ${n.systemIntegrityStatus}
            </span>
          </div>

          <!-- Conflict Metrics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-xs font-semibold uppercase text-slate-400 block">Doctor Overlaps</span>
              <span class="text-2xl font-bold text-slate-900 mt-1 block">${n.doctorOverlapConflicts}</span>
              <span class="text-[11px] text-slate-500">Double-booked slots</span>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-xs font-semibold uppercase text-slate-400 block">Patient Overlaps</span>
              <span class="text-2xl font-bold text-slate-900 mt-1 block">${n.patientOverlapConflicts}</span>
              <span class="text-[11px] text-slate-500">Simultaneous patient bookings</span>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span class="text-xs font-semibold uppercase text-slate-400 block">Rest Period Violations</span>
              <span class="text-2xl font-bold text-slate-900 mt-1 block">${n.restPeriodConflicts}</span>
              <span class="text-[11px] text-slate-500">Intrusion into protected breaks</span>
            </div>
          </div>

          <!-- Conflicts List -->
          ${!i&&n.conflicts&&n.conflicts.length>0?`
            <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div class="p-4 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 uppercase">
                Detected Conflicts (${n.conflicts.length})
              </div>
              <div class="divide-y divide-slate-100 text-xs">
                ${n.conflicts.map(c=>{var m,x;return`
                  <div class="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800">
                          ${l(c.conflictType)}
                        </span>
                        <span class="font-bold text-slate-900">Appt #${c.appointmentId}${c.secondaryAppointmentId?` & #${c.secondaryAppointmentId}`:""}</span>
                        <span class="text-slate-500 font-mono">${c.date} (${(m=c.startTime)==null?void 0:m.substring(0,5)} - ${(x=c.endTime)==null?void 0:x.substring(0,5)})</span>
                      </div>
                      <p class="text-slate-700 mt-1 font-medium">${l(c.description)}</p>
                      <p class="text-indigo-600 mt-0.5">Recommendation: ${l(c.recommendation)}</p>
                    </div>
                    <button onclick="window.switchTab('appointments')" class="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition whitespace-nowrap self-start sm:self-auto">
                      Resolve &rarr;
                    </button>
                  </div>
                `}).join("")}
              </div>
            </div>
          `:""}
        </div>
      `}catch(n){t.innerHTML=`<div class="p-6 text-center text-rose-600 text-xs">${l(n.message)}</div>`}}};(s=document.getElementById("run-scan-btn"))==null||s.addEventListener("click",()=>{o(document.getElementById("scan-from-date").value)}),o(e)}window.switchTab=E;window.closeModal=y;window.renderDashboard=D;window.handleCheckIn=async e=>{try{await p.checkInAppointment(e),d(`Patient checked in successfully for Appointment #${e}`),v==="dashboard"?D():v==="queue"?j():S()}catch(o){d(o.message,"error")}};window.handleEditPatient=async e=>{try{const o=await p.getPatient(e);B(o)}catch(o){d(o.message,"error")}};window.handleDeactivatePatient=async(e,o)=>{if(confirm(`Are you sure you want to deactivate patient "${o}"?
Historical appointments will be preserved.`))try{await p.deactivatePatient(e),d(`Patient "${o}" deactivated successfully.`),H()}catch(s){d(s.message,"error")}};window.handleEditDoctor=async e=>{try{const o=await p.getDoctor(e);F(o)}catch(o){d(o.message,"error")}};window.handleManageAvailability=(e,o)=>{J(e,o)};window.handleManageRestPeriods=(e,o)=>{G(e,o)};window.handleViewTimeline=(e,o)=>{Y(e,o)};window.handleDeleteAvailability=async(e,o,s)=>{if(confirm("Remove this availability shift?"))try{await p.deleteDoctorAvailability(e),d("Availability shift deleted"),J(o,s)}catch(a){d(a.message,"error")}};window.handleDeleteRestPeriod=async(e,o,s)=>{if(confirm("Remove this protected rest period?"))try{await p.deleteDoctorRestPeriod(e),d("Protected rest period removed"),G(o,s)}catch(a){d(a.message,"error")}};window.handleRescheduleModal=(e,o,s,a)=>{h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Reschedule Appointment #${e}</h3>
    <p class="text-xs text-slate-500 mb-4">Every appointment must last exactly 20 minutes and avoid protected doctor rest periods.</p>

    <form id="reschedule-form" class="space-y-3.5">
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1">New Date *</label>
        <input type="date" name="appointmentDate" required value="${o}" min="${new Date().toISOString().split("T")[0]}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New Start Time *</label>
          <input type="time" name="startTime" id="reschedule-start-time" required value="${s==null?void 0:s.substring(0,5)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">New End Time (Auto 20m) *</label>
          <input type="time" name="endTime" id="reschedule-end-time" readonly required value="${O(s==null?void 0:s.substring(0,5),20)}" class="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-600 focus:outline-none" />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <button type="button" onclick="window.closeModal()" class="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition">Cancel</button>
        <button type="submit" class="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow transition">Save New Time</button>
      </div>
    </form>
  `);const t=document.getElementById("reschedule-start-time"),n=document.getElementById("reschedule-end-time");t.addEventListener("input",()=>{n.value=O(t.value,20)}),document.getElementById("reschedule-form").addEventListener("submit",async i=>{i.preventDefault();const c=new FormData(i.target),m={appointmentDate:c.get("appointmentDate"),startTime:c.get("startTime")+":00",endTime:c.get("endTime")+":00"};try{await p.rescheduleAppointment(e,m),d("Appointment rescheduled successfully"),y(),v==="dashboard"?D():S()}catch(x){d(x.message,"error")}})};window.handleCancelModal=e=>{h(`
    <h3 class="text-lg font-bold text-slate-900 mb-1">Cancel Appointment #${e}</h3>
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
  `),document.getElementById("cancel-form").addEventListener("submit",async o=>{o.preventDefault();const a=new FormData(o.target).get("cancellationReason");try{await p.cancelAppointment(e,a),d("Appointment cancelled successfully (slot released to waitlist)","info"),y(),v==="dashboard"?D():v==="queue"?j():S()}catch(t){d(t.message,"error")}})};window.handleStatusUpdate=async(e,o)=>{try{await p.updateAppointmentStatus(e,o),d(`Appointment #${e} marked as ${o}`),v==="dashboard"?D():v==="queue"?j():S()}catch(s){d(s.message,"error")}};$().then(()=>{E("dashboard")});
