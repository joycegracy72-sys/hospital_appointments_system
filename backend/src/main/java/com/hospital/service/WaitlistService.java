package com.hospital.service;

import com.hospital.dto.request.AppointmentRequest;
import com.hospital.dto.request.WaitlistRequest;
import com.hospital.dto.response.AppointmentDetailResponse;
import com.hospital.dto.response.WaitlistResponse;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.Patient;
import com.hospital.model.WaitlistEntry;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.PatientRepository;
import com.hospital.repository.WaitlistRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WaitlistService {

    private static final Logger log = LoggerFactory.getLogger(WaitlistService.class);

    private final WaitlistRepository waitlistRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final SchedulingEngineService schedulingEngine;

    public WaitlistService(WaitlistRepository waitlistRepository,
                           PatientRepository patientRepository,
                           DoctorRepository doctorRepository,
                           AppointmentRepository appointmentRepository,
                           SchedulingEngineService schedulingEngine) {
        this.waitlistRepository = waitlistRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.schedulingEngine = schedulingEngine;
    }

    public List<WaitlistResponse> getWaitlist(String status, LocalDate date) {
        // Expire any stale offers first
        waitlistRepository.expireStaleOffers(LocalDateTime.now());
        return waitlistRepository.findAll(status, date).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public WaitlistResponse addToWaitlist(WaitlistRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + request.getPatientId()));
        if (!patient.isActive()) {
            throw new BusinessConflictException("Cannot add a deactivated patient to the waitlist.");
        }

        if (request.getPreferredDate().isBefore(LocalDate.now())) {
            throw new BusinessConflictException("Waitlist preferred date cannot be in the past.");
        }

        String specialization = request.getSpecialization();
        if (request.getDoctorId() != null) {
            Doctor doctor = doctorRepository.findById(request.getDoctorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));
            if (!doctor.isActive()) {
                throw new BusinessConflictException("Cannot waitlist for an inactive doctor.");
            }
            if (specialization == null || specialization.isBlank()) {
                specialization = doctor.getSpecialization();
            }
        }

        WaitlistEntry entry = new WaitlistEntry();
        entry.setPatientId(request.getPatientId());
        entry.setDoctorId(request.getDoctorId());
        entry.setSpecialization(specialization);
        entry.setPreferredDate(request.getPreferredDate());
        entry.setPreferredStartTime(request.getPreferredStartTime());
        entry.setPreferredEndTime(request.getPreferredEndTime());
        entry.setStatus(WaitlistEntry.Status.WAITING.name());
        entry.setNotes(request.getNotes());

        Long id = waitlistRepository.save(entry);
        WaitlistEntry saved = waitlistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Failed to retrieve created waitlist entry"));

        return mapToResponse(saved);
    }

    /**
     * Called automatically when an appointment is cancelled to trigger intelligent waitlist matching.
     */
    @Transactional
    public void processCancelledSlot(Appointment cancelled) {
        if (cancelled.getAppointmentDate().isBefore(LocalDate.now())) {
            return;
        }

        Doctor doctor = doctorRepository.findById(cancelled.getDoctorId()).orElse(null);
        if (doctor == null || !doctor.isActive()) {
            return;
        }

        // Expire older unaccepted offers
        waitlistRepository.expireStaleOffers(LocalDateTime.now());

        // Find candidate waiting patients (FIFO)
        List<WaitlistEntry> candidates = waitlistRepository.findMatchingEntries(
                doctor.getSpecialization(),
                doctor.getDoctorId(),
                cancelled.getAppointmentDate(),
                cancelled.getStartTime(),
                cancelled.getEndTime()
        );

        if (candidates.isEmpty()) {
            log.info("No matching waitlist entries found for cancelled slot on {} {} - {}",
                    cancelled.getAppointmentDate(), cancelled.getStartTime(), cancelled.getEndTime());
            return;
        }

        // Evaluate candidates in FIFO order until finding an eligible patient
        for (WaitlistEntry candidate : candidates) {
            // Verify patient has no conflicting appointment
            boolean patientConflict = appointmentRepository.hasPatientOverlap(
                    candidate.getPatientId(),
                    cancelled.getAppointmentDate(),
                    cancelled.getStartTime(),
                    cancelled.getEndTime(),
                    null
            );
            if (patientConflict) {
                continue; // Skip conflicted patient and move to next
            }

            // Calculate expiration time (24 hours from now, or 2 hours if date is today)
            LocalDateTime expiresAt = cancelled.getAppointmentDate().equals(LocalDate.now())
                    ? LocalDateTime.now().plusHours(2)
                    : LocalDateTime.now().plusHours(24);

            int updated = waitlistRepository.updateOffer(
                    candidate.getWaitlistId(),
                    doctor.getDoctorId(),
                    cancelled.getAppointmentDate(),
                    cancelled.getStartTime(),
                    cancelled.getEndTime(),
                    expiresAt
            );

            if (updated > 0) {
                log.info("Offered cancelled slot ({} {} - {}) to waitlisted patient ID #{}",
                        cancelled.getAppointmentDate(), cancelled.getStartTime(), cancelled.getEndTime(), candidate.getPatientId());
                break; // Only offer to one patient at a time to prevent double-booking
            }
        }
    }

    /**
     * Explicit acceptance of a waitlist offer by the patient.
     * Revalidates availability immediately before booking to guarantee race-free concurrency.
     */
    @Transactional
    public AppointmentDetailResponse acceptOffer(Long waitlistId) {
        WaitlistEntry entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found with ID: " + waitlistId));

        if (!WaitlistEntry.Status.OFFERED.name().equals(entry.getStatus())) {
            throw new BusinessConflictException("This waitlist slot is not in OFFERED state (current status: " + entry.getStatus() + ").");
        }

        if (entry.getOfferExpiresAt() != null && entry.getOfferExpiresAt().isBefore(LocalDateTime.now())) {
            waitlistRepository.updateStatus(waitlistId, WaitlistEntry.Status.EXPIRED.name());
            throw new BusinessConflictException("The waitlist offer has expired. The slot has been released.");
        }

        // Revalidate the slot!
        Long doctorId = entry.getOfferedDoctorId();
        LocalDate date = entry.getOfferedAppointmentDate();
        LocalTime start = entry.getOfferedStartTime();
        LocalTime end = entry.getOfferedEndTime();

        // 1. Check rest periods
        if (schedulingEngine.isRestPeriodConflict(doctorId, date, start, end)) {
            waitlistRepository.updateStatus(waitlistId, WaitlistEntry.Status.CANCELLED.name());
            throw new BusinessConflictException("The offered slot now conflicts with a protected doctor rest period.");
        }

        // 2. Check doctor overlap
        if (appointmentRepository.hasOverlap(doctorId, date, start, end, null)) {
            waitlistRepository.updateStatus(waitlistId, WaitlistEntry.Status.CANCELLED.name());
            throw new BusinessConflictException("The offered slot was already booked by another confirmation.");
        }

        // 3. Check patient overlap
        if (appointmentRepository.hasPatientOverlap(entry.getPatientId(), date, start, end, null)) {
            waitlistRepository.updateStatus(waitlistId, WaitlistEntry.Status.CANCELLED.name());
            throw new BusinessConflictException("Patient has another conflicting appointment during this time window.");
        }

        // Create the appointment
        Appointment appt = new Appointment();
        appt.setPatientId(entry.getPatientId());
        appt.setDoctorId(doctorId);
        appt.setAppointmentDate(date);
        appt.setStartTime(start);
        appt.setEndTime(end);
        appt.setStatus(Appointment.Status.SCHEDULED.name());
        appt.setReasonForVisit("Waitlist matched: " + (entry.getNotes() != null ? entry.getNotes() : "Preferred appointment"));
        appt.setNotes("Confirmed from Waitlist #" + waitlistId);

        Long apptId = appointmentRepository.save(appt);
        waitlistRepository.updateStatus(waitlistId, WaitlistEntry.Status.ACCEPTED.name());
        log.info("Waitlist #{} successfully converted to Appointment #{}", waitlistId, apptId);

        return appointmentRepository.findDetailById(apptId)
                .orElseThrow(() -> new ResourceNotFoundException("Failed to load confirmed appointment"));
    }

    @Transactional
    public void rejectOffer(Long waitlistId) {
        WaitlistEntry entry = waitlistRepository.findById(waitlistId)
                .orElseThrow(() -> new ResourceNotFoundException("Waitlist entry not found with ID: " + waitlistId));

        waitlistRepository.updateStatus(waitlistId, WaitlistEntry.Status.CANCELLED.name());

        // Re-offer the slot to next in queue if valid
        if (entry.getOfferedDoctorId() != null && entry.getOfferedAppointmentDate() != null) {
            Appointment placeholder = new Appointment();
            placeholder.setDoctorId(entry.getOfferedDoctorId());
            placeholder.setAppointmentDate(entry.getOfferedAppointmentDate());
            placeholder.setStartTime(entry.getOfferedStartTime());
            placeholder.setEndTime(entry.getOfferedEndTime());
            processCancelledSlot(placeholder);
        }
    }

    private WaitlistResponse mapToResponse(WaitlistEntry w) {
        WaitlistResponse res = new WaitlistResponse();
        res.setWaitlistId(w.getWaitlistId());
        res.setPatientId(w.getPatientId());
        res.setPatientName(w.getPatientName());
        res.setDoctorId(w.getDoctorId());
        res.setDoctorName(w.getDoctorName());
        res.setSpecialization(w.getSpecialization());
        res.setPreferredDate(w.getPreferredDate());
        res.setPreferredStartTime(w.getPreferredStartTime());
        res.setPreferredEndTime(w.getPreferredEndTime());
        res.setStatus(w.getStatus());
        res.setOfferedAppointmentDate(w.getOfferedAppointmentDate());
        res.setOfferedStartTime(w.getOfferedStartTime());
        res.setOfferedEndTime(w.getOfferedEndTime());
        res.setOfferedDoctorId(w.getOfferedDoctorId());
        res.setOfferedDoctorName(w.getOfferedDoctorName());
        res.setOfferExpiresAt(w.getOfferExpiresAt());
        res.setNotes(w.getNotes());
        res.setCreatedAt(w.getCreatedAt());
        return res;
    }
}
