package com.hospital.service;

import com.hospital.dto.request.AppointmentCancelRequest;
import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.AppointmentRescheduleRequest;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Service managing appointment scheduling, validations, conflict checks, and lifecycle states.
 */
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              DoctorAvailabilityRepository availabilityRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public List<AppointmentDetailResponse> getAppointments(LocalDate date, Long doctorId, Long patientId, String status) {
        return appointmentRepository.findAllDetails(date, doctorId, patientId, status);
    }

    public AppointmentDetailResponse getAppointmentById(Long id) {
        return appointmentRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }

    @Transactional
    public AppointmentDetailResponse bookAppointment(AppointmentRequest request) {
        // 1. Time range validity
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Appointment end time must be strictly after start time");
        }

        // 2. Validate Patient existence & active status
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));
        if (!patient.isActive()) {
            throw new BusinessConflictException("Cannot book appointment for a deactivated patient. Please activate patient first.");
        }

        // 3. Validate Doctor existence & active status
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));
        if (!doctor.isActive()) {
            throw new BusinessConflictException("Cannot book appointment with an inactive doctor.");
        }

        // 4. Validate Doctor Availability (if schedule is configured for that doctor & date)
        if (availabilityRepository.hasAnyAvailabilityConfigured(doctor.getDoctorId(), request.getAppointmentDate())) {
            boolean isSlotAvailable = availabilityRepository.isDoctorAvailable(
                    doctor.getDoctorId(),
                    request.getAppointmentDate(),
                    request.getStartTime(),
                    request.getEndTime()
            );
            if (!isSlotAvailable) {
                throw new BusinessConflictException("The requested time is outside Dr. " + doctor.getFullName() +
                        "'s scheduled availability for " + request.getAppointmentDate());
            }
        }

        // 5. Prevent Overlapping Appointments for the same doctor
        boolean overlap = appointmentRepository.hasOverlap(
                doctor.getDoctorId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );
        if (overlap) {
            throw new BusinessConflictException("Doctor already has an active overlapping appointment during this time slot.");
        }

        // 6. Persist new Appointment
        Appointment appointment = new Appointment();
        appointment.setPatientId(patient.getPatientId());
        appointment.setDoctorId(doctor.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(request.getEndTime());
        appointment.setStatus(Appointment.Status.SCHEDULED.name());
        appointment.setReasonForVisit(request.getReasonForVisit());
        appointment.setNotes(request.getNotes());

        Long newId = appointmentRepository.save(appointment);
        return getAppointmentById(newId);
    }

    @Transactional
    public AppointmentDetailResponse rescheduleAppointment(Long id, AppointmentRescheduleRequest request) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        if (Appointment.Status.CANCELLED.name().equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessConflictException("Cannot reschedule a cancelled appointment.");
        }
        if (Appointment.Status.COMPLETED.name().equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessConflictException("Cannot reschedule an already completed appointment.");
        }

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Appointment end time must be strictly after start time");
        }

        // Check availability bounds
        if (availabilityRepository.hasAnyAvailabilityConfigured(existing.getDoctorId(), request.getAppointmentDate())) {
            boolean isSlotAvailable = availabilityRepository.isDoctorAvailable(
                    existing.getDoctorId(),
                    request.getAppointmentDate(),
                    request.getStartTime(),
                    request.getEndTime()
            );
            if (!isSlotAvailable) {
                throw new BusinessConflictException("Requested slot is outside doctor's configured availability schedule.");
            }
        }

        // Check overlapping appointments (excluding current appointment ID)
        boolean overlap = appointmentRepository.hasOverlap(
                existing.getDoctorId(),
                request.getAppointmentDate(),
                request.getStartTime(),
                request.getEndTime(),
                id
        );
        if (overlap) {
            throw new BusinessConflictException("Doctor already has another active appointment during this rescheduled time slot.");
        }

        appointmentRepository.reschedule(id, request.getAppointmentDate(), request.getStartTime(), request.getEndTime());
        return getAppointmentById(id);
    }

    @Transactional
    public AppointmentDetailResponse cancelAppointment(Long id, AppointmentCancelRequest request) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        if (Appointment.Status.CANCELLED.name().equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessConflictException("Appointment is already cancelled.");
        }
        if (Appointment.Status.COMPLETED.name().equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessConflictException("Cannot cancel an appointment that has already taken place.");
        }

        appointmentRepository.cancel(id, request.getCancellationReason());
        return getAppointmentById(id);
    }

    @Transactional
    public AppointmentDetailResponse updateStatus(Long id, String status, String notes) {
        appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        appointmentRepository.updateStatus(id, status.toUpperCase(), notes);
        return getAppointmentById(id);
    }
}
