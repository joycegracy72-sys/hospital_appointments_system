/**
 * Centralized API client for Spring Boot REST API endpoints.
 * Handles JSON request/response encoding and uniform error handling.
 */

const BASE_URL = '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = (result && (result.message || result.error)) || `HTTP ${response.status}: ${response.statusText}`;
      const validationErrors = result && result.data ? Object.values(result.data).join(', ') : null;
      throw new Error(validationErrors ? `${errorMsg} (${validationErrors})` : errorMsg);
    }

    return result ? result.data : null;
  } catch (error) {
    console.error(`API Error on ${url}:`, error);
    throw error;
  }
}

export const api = {
  // Dashboard
  getDashboardStats() {
    return request('/dashboard/stats');
  },

  // Patients
  getPatients(search = '', activeOnly = false) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (activeOnly) params.append('activeOnly', 'true');
    const query = params.toString();
    return request(`/patients${query ? '?' + query : ''}`);
  },

  getPatient(id) {
    return request(`/patients/${id}`);
  },

  createPatient(data) {
    return request('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePatient(id, data) {
    return request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deactivatePatient(id) {
    return request(`/patients/${id}`, {
      method: 'DELETE',
    });
  },

  // Doctors
  getDoctors(search = '', specialization = '', activeOnly = false) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialization) params.append('specialization', specialization);
    if (activeOnly) params.append('activeOnly', 'true');
    const query = params.toString();
    return request(`/doctors${query ? '?' + query : ''}`);
  },

  getDoctor(id) {
    return request(`/doctors/${id}`);
  },

  createDoctor(data) {
    return request('/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDoctor(id, data) {
    return request(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getSpecializations() {
    return request('/doctors/specializations');
  },

  getDoctorAvailability(doctorId) {
    return request(`/doctors/${doctorId}/availability`);
  },

  addDoctorAvailability(doctorId, data) {
    return request(`/doctors/${doctorId}/availability`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteDoctorAvailability(availabilityId) {
    return request(`/doctors/availability/${availabilityId}`, {
      method: 'DELETE',
    });
  },

  // Protected Doctor Rest Periods
  getDoctorRestPeriods(doctorId) {
    return request(`/doctors/${doctorId}/rest-periods`);
  },

  addDoctorRestPeriod(doctorId, data) {
    return request(`/doctors/${doctorId}/rest-periods`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteDoctorRestPeriod(restId) {
    return request(`/doctors/rest-periods/${restId}`, {
      method: 'DELETE',
    });
  },

  // Doctor Timeline & Workload
  getDoctorTimeline(doctorId, date) {
    return request(`/doctors/${doctorId}/timeline?date=${date}`);
  },

  getDoctorWorkload(date) {
    const query = date ? `?date=${date}` : '';
    return request(`/doctors/workload${query}`);
  },

  // Appointments
  getAppointments({ date, doctorId, patientId, status } = {}) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (doctorId) params.append('doctorId', doctorId);
    if (patientId) params.append('patientId', patientId);
    if (status) params.append('status', status);
    const query = params.toString();
    return request(`/appointments${query ? '?' + query : ''}`);
  },

  getAppointment(id) {
    return request(`/appointments/${id}`);
  },

  bookAppointment(data) {
    return request('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  rescheduleAppointment(id, data) {
    return request(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  cancelAppointment(id, cancellationReason) {
    return request(`/appointments/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
  },

  updateAppointmentStatus(id, status, notes = '') {
    const params = new URLSearchParams({ status });
    if (notes) params.append('notes', notes);
    return request(`/appointments/${id}/status?${params.toString()}`, {
      method: 'PATCH',
    });
  },

  checkInAppointment(id) {
    return request(`/appointments/${id}/check-in`, {
      method: 'PATCH',
    });
  },

  // Intelligent Slot Recommendations
  recommendSlot(doctorId, patientId, date, preferredStartTime) {
    const params = new URLSearchParams({ doctorId, patientId, date });
    if (preferredStartTime) params.append('preferredStartTime', preferredStartTime);
    return request(`/appointments/recommend?${params.toString()}`);
  },

  recommendWorkloadBalancedSlot(specialization, patientId, date, preferredStartTime) {
    const params = new URLSearchParams({ specialization, patientId, date });
    if (preferredStartTime) params.append('preferredStartTime', preferredStartTime);
    return request(`/appointments/recommend/workload?${params.toString()}`);
  },

  // Live Patient Queue
  getLiveQueue({ date, doctorId } = {}) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (doctorId) params.append('doctorId', doctorId);
    const query = params.toString();
    return request(`/appointments/queue${query ? '?' + query : ''}`);
  },

  // Schedule Conflicts Scanner
  getScheduleConflicts(fromDate) {
    const query = fromDate ? `?fromDate=${fromDate}` : '';
    return request(`/appointments/conflicts${query}`);
  },

  // Schedule Digital Twin / What-If Simulator
  previewSimulation(data) {
    return request('/simulation/preview', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  applySimulation(data) {
    return request('/simulation/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Intelligent Cancellation Waitlist
  getWaitlist({ status, date } = {}) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (date) params.append('date', date);
    const query = params.toString();
    return request(`/waitlist${query ? '?' + query : ''}`);
  },

  addToWaitlist(data) {
    return request('/waitlist', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  acceptWaitlistOffer(id) {
    return request(`/waitlist/${id}/accept`, {
      method: 'POST',
    });
  },

  rejectWaitlistOffer(id) {
    return request(`/waitlist/${id}/reject`, {
      method: 'POST',
    });
  },
};
