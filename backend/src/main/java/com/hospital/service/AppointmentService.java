package com.hospital.service;

import com.hospital.dto.request.AppointmentCancelRequest;
import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.AppointmentRescheduleRequest;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.dto.response.ConflictReportResponse;
import com.hospital.dto.response.ConflictReportResponse.ConflictItemDTO;
import com.hospital.dto.response.QueueItemResponse;
import com.hospital.dto.response.SlotRecommendationResponse;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service managing appointment scheduling, 20-minute fixed duration enforcement,
 * protected rest period validation, conflict checking, waitlist cascading, and live queue.
 */
@Service
public class AppointmentService {

    private static final Logger log = LoggerFactory.getLogger(AppointmentService.class);
    public static final int APPOINTMENT_MINUTES = 20;

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final SchedulingEngineService schedulingEngine;
    private final WaitlistService waitlistService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository,
                              DoctorAvailabilityRepository availabilityRepository,
                              SchedulingEngineService schedulingEngine,
                              WaitlistService waitlistService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
        this.schedulingEngine = schedulingEngine;
        this.waitlistService = waitlistService;
    }

    public List<AppointmentDetailResponse> getAppointments(LocalDate date, Long doctorId, Long patientId, String status) {
        return appointmentRepository.findAllDetails(date, doctorId, patientId, status);
    }

    public AppointmentDetailResponse getAppointmentById(Long id) {
        return appointmentRepository.findDetailById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));
    }

    /**
     * Delegates single-doctor recommendation to the intelligent Scheduling Engine.
     */
    public SlotRecommendationResponse recommendSlot(Long doctorId, Long patientId, LocalDate date, LocalTime preferredStartTime) {
        return schedulingEngine.recommendSlot(doctorId, patientId, date, preferredStartTime);
    }

    /**
     * Delegates specialization workload-balanced recommendation to the Scheduling Engine.
     */
    public SlotRecommendationResponse recommendWorkloadBalancedSlot(String specialization, Long patientId, LocalDate date, LocalTime preferredStartTime) {
        return schedulingEngine.recommendWorkloadBalancedSlot(specialization, patientId, date, preferredStartTime);
    }

    /**
     * Validates that an appointment slot strictly meets all hospital constraints:
     * - Future or present date only
     * - Fixed 20-minute duration
     * - Within doctor's configured availability window (if defined)
     * - Does NOT collide with any protected rest period (lunch/custom)
     * - Does NOT collide with another active doctor appointment
     * - Does NOT collide with another active patient appointment
     */
    public void validateSlot(Long doctorId, String doctorName, LocalDate date, LocalTime start,
                             LocalTime end, Long excludeAppointmentId, Long patientId, boolean includePatientCheck) {
        if (date.isBefore(LocalDate.now())) {
            throw new BusinessConflictException("Appointment date cannot be in the past.");
        }
        if (!end.equals(start.plusMinutes(APPOINTMENT_MINUTES))) {
            throw new BusinessConflictException("Every appointment must last exactly " + APPOINTMENT_MINUTES + " minutes.");
        }

        // Doctor availability schedule check
        if (availabilityRepository.hasAnyAvailabilityConfigured(doctorId, date)) {
            if (!availabilityRepository.isDoctorAvailable(doctorId, date, start, end)) {
                throw new BusinessConflictException("The requested time is outside Dr. " + doctorName
                        + "'s configured availability for " + date + ".");
            }
        }

        // Protected rest period check
        String restReason = schedulingEngine.getRestPeriodReason(doctorId, date, start, end);
        if (restReason != null) {
            throw new BusinessConflictException("The requested slot overlaps a protected rest period: " + restReason +
                    ". Suggested alternative: select a slot outside the protected rest window.");
        }

        // Doctor overlapping appointments check
        if (appointmentRepository.hasOverlap(doctorId, date, start, end, excludeAppointmentId)) {
            throw new BusinessConflictException("Doctor already has an active overlapping appointment during this time slot.");
        }

        // Patient concurrent booking check
        if (includePatientCheck && patientId != null && appointmentRepository.hasPatientOverlap(patientId, date, start, end, excludeAppointmentId)) {
            throw new BusinessConflictException("Patient already has an active overlapping appointment during this time slot.");
        }
    }

    @Transactional
    public AppointmentDetailResponse bookAppointment(AppointmentRequest request) {
        // Enforce fixed 20-minute appointment on the backend
        LocalTime calculatedEnd = request.getStartTime().plusMinutes(APPOINTMENT_MINUTES);

        // Validate Patient existence & active status
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));
        if (!patient.isActive()) {
            throw new BusinessConflictException("Cannot book appointment for a deactivated patient. Please activate patient first.");
        }

        // Validate Doctor existence & active status
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));
        if (!doctor.isActive()) {
            throw new BusinessConflictException("Cannot book appointment with an inactive doctor.");
        }

        // Validate slot against all constraints
        validateSlot(doctor.getDoctorId(), doctor.getFullName(), request.getAppointmentDate(),
                request.getStartTime(), calculatedEnd, null, patient.getPatientId(), true);

        // Persist new Appointment
        Appointment appointment = new Appointment();
        appointment.setPatientId(patient.getPatientId());
        appointment.setDoctorId(doctor.getDoctorId());
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setStartTime(request.getStartTime());
        appointment.setEndTime(calculatedEnd);
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

        Doctor doctor = doctorRepository.findById(existing.getDoctorId()).orElse(null);
        String docName = doctor != null ? doctor.getFullName() : "the doctor";
        LocalTime calculatedEnd = request.getStartTime().plusMinutes(APPOINTMENT_MINUTES);

        validateSlot(existing.getDoctorId(), docName, request.getAppointmentDate(),
                request.getStartTime(), calculatedEnd, id, existing.getPatientId(), true);

        appointmentRepository.reschedule(id, request.getAppointmentDate(), request.getStartTime(), calculatedEnd);
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

        // Intelligent Waitlist: Cascade cancelled slot to waiting patients
        try {
            waitlistService.processCancelledSlot(existing);
        } catch (Exception e) {
            log.warn("Waitlist notification failed after cancelling appointment #{}: {}", id, e.getMessage());
        }

        return getAppointmentById(id);
    }

    @Transactional
    public AppointmentDetailResponse updateStatus(Long id, String status, String notes) {
        appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        appointmentRepository.updateStatus(id, status.toUpperCase(), notes);
        return getAppointmentById(id);
    }

    @Transactional
    public AppointmentDetailResponse checkInAppointment(Long id) {
        Appointment existing = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with ID: " + id));

        if (Appointment.Status.CANCELLED.name().equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessConflictException("Cannot check in a cancelled appointment.");
        }
        if (Appointment.Status.COMPLETED.name().equalsIgnoreCase(existing.getStatus())) {
            throw new BusinessConflictException("Cannot check in an already completed appointment.");
        }

        appointmentRepository.checkIn(id, LocalDateTime.now());
        return getAppointmentById(id);
    }

    /**
     * Returns the Live Patient Queue for a specified date and optional doctor,
     * with queue position and estimated wait time calculation.
     */
    public List<QueueItemResponse> getLiveQueue(LocalDate date, Long doctorId) {
        List<AppointmentDetailResponse> appts = appointmentRepository.findQueueByDate(date, doctorId);
        List<QueueItemResponse> queue = new ArrayList<>();

        int position = 1;
        for (AppointmentDetailResponse appt : appts) {
            QueueItemResponse item = new QueueItemResponse();
            item.setAppointmentId(appt.getAppointmentId());
            item.setQueuePosition(position);
            item.setPatientId(appt.getPatientId());
            item.setPatientName(appt.getPatientName());
            item.setDoctorId(appt.getDoctorId());
            item.setDoctorName(appt.getDoctorName());
            item.setAppointmentDate(appt.getAppointmentDate());
            item.setScheduledStartTime(appt.getStartTime());
            item.setScheduledEndTime(appt.getEndTime());
            item.setCheckInTime(appt.getCheckInTime());
            item.setStatus(appt.getStatus());

            int waitMinutes = (position - 1) * APPOINTMENT_MINUTES;
            item.setEstimatedWaitMinutes(waitMinutes);
            if ("CHECKED_IN".equalsIgnoreCase(appt.getStatus())) {
                item.setWaitTimeExplanation("Patient checked in. Next in line (~" + waitMinutes + " min wait).");
            } else {
                item.setWaitTimeExplanation("Scheduled (" + appt.getStartTime() + "). Estimated wait: " + waitMinutes + " mins.");
            }

            queue.add(item);
            position++;
        }
        return queue;
    }

    /**
     * Administrative Conflict Scanner:
     * Inspects active appointments to detect doctor overlaps, patient overlaps,
     * rest-period violations, or availability breaches.
     */
    public ConflictReportResponse detectScheduleConflicts(LocalDate fromDate) {
        List<AppointmentDetailResponse> list = appointmentRepository.findAllActiveForConflictDetection(fromDate);
        ConflictReportResponse report = new ConflictReportResponse();

        int docOverlaps = 0;
        int patOverlaps = 0;
        int restCollisions = 0;

        for (int i = 0; i < list.size(); i++) {
            AppointmentDetailResponse a1 = list.get(i);

            // Check rest period collision
            String restReason = schedulingEngine.getRestPeriodReason(a1.getDoctorId(), a1.getAppointmentDate(), a1.getStartTime(), a1.getEndTime());
            if (restReason != null) {
                restCollisions++;
                ConflictItemDTO c = new ConflictItemDTO();
                c.setConflictType("REST_PERIOD_VIOLATION");
                c.setAppointmentId(a1.getAppointmentId());
                c.setDoctorId(a1.getDoctorId());
                c.setDoctorName(a1.getDoctorName());
                c.setPatientId(a1.getPatientId());
                c.setPatientName(a1.getPatientName());
                c.setDate(a1.getAppointmentDate());
                c.setStartTime(a1.getStartTime());
                c.setEndTime(a1.getEndTime());
                c.setDescription("Appointment overlaps doctor's " + restReason);
                c.setRecommendation("Reschedule appointment to a slot outside the protected rest period.");
                report.getConflicts().add(c);
            }

            // Pairwise comparison for overlaps
            for (int j = i + 1; j < list.size(); j++) {
                AppointmentDetailResponse a2 = list.get(j);
                if (!a1.getAppointmentDate().equals(a2.getAppointmentDate())) {
                    continue;
                }

                boolean overlapsTime = a1.getStartTime().isBefore(a2.getEndTime()) && a1.getEndTime().isAfter(a2.getStartTime());
                if (!overlapsTime) continue;

                // Doctor overlap
                if (a1.getDoctorId().equals(a2.getDoctorId())) {
                    docOverlaps++;
                    ConflictItemDTO c = new ConflictItemDTO();
                    c.setConflictType("DOCTOR_OVERLAP");
                    c.setAppointmentId(a1.getAppointmentId());
                    c.setSecondaryAppointmentId(a2.getAppointmentId());
                    c.setDoctorId(a1.getDoctorId());
                    c.setDoctorName(a1.getDoctorName());
                    c.setPatientId(a1.getPatientId());
                    c.setPatientName(a1.getPatientName() + " vs " + a2.getPatientName());
                    c.setDate(a1.getAppointmentDate());
                    c.setStartTime(a1.getStartTime());
                    c.setEndTime(a1.getEndTime());
                    c.setDescription("Double-booking: Dr. " + a1.getDoctorName() + " has two overlapping active appointments (#" +
                            a1.getAppointmentId() + " and #" + a2.getAppointmentId() + ")");
                    c.setRecommendation("Reschedule one of the conflicting appointments using the intelligent recommendation engine.");
                    report.getConflicts().add(c);
                }

                // Patient overlap
                if (a1.getPatientId().equals(a2.getPatientId())) {
                    patOverlaps++;
                    ConflictItemDTO c = new ConflictItemDTO();
                    c.setConflictType("PATIENT_OVERLAP");
                    c.setAppointmentId(a1.getAppointmentId());
                    c.setSecondaryAppointmentId(a2.getAppointmentId());
                    c.setDoctorId(a1.getDoctorId());
                    c.setDoctorName(a1.getDoctorName() + " & Dr. " + a2.getDoctorName());
                    c.setPatientId(a1.getPatientId());
                    c.setPatientName(a1.getPatientName());
                    c.setDate(a1.getAppointmentDate());
                    c.setStartTime(a1.getStartTime());
                    c.setEndTime(a1.getEndTime());
                    c.setDescription("Patient " + a1.getPatientName() + " is booked for two simultaneous appointments (#" +
                            a1.getAppointmentId() + " and #" + a2.getAppointmentId() + ")");
                    c.setRecommendation("Reschedule one of the appointments to avoid patient conflict.");
                    report.getConflicts().add(c);
                }
            }
        }

        report.setTotalConflicts(report.getConflicts().size());
        report.setDoctorOverlapConflicts(docOverlaps);
        report.setPatientOverlapConflicts(patOverlaps);
        report.setRestPeriodConflicts(restCollisions);
        report.setSystemIntegrityStatus(report.getTotalConflicts() == 0 ? "HEALTHY" : "ATTENTION_REQUIRED");

        return report;
    }
}
