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
};
