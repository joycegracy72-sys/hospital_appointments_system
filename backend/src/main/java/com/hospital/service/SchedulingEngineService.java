package com.hospital.service;

import com.hospital.dto.response.DoctorTimelineResponse;
import com.hospital.dto.response.DoctorWorkloadDTO;
import com.hospital.dto.response.SlotRecommendationResponse;
import com.hospital.dto.response.SlotRecommendationResponse.SlotOptionDTO;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.model.DoctorRestPeriod;
import com.hospital.model.Patient;
import com.hospital.repository.AppointmentRepository;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DoctorRestPeriodRepository;
import com.hospital.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * Core Scheduling Engine enforcing mandatory hospital constraints:
 * 1. Fixed 20-Minute Appointments.
 * 2. Protected Doctor Rest Periods.
 * 3. Working-Hour Boundary Validation.
 * 4. Deterministic Slot Recommendation with Explainable Decisions.
 * 5. Adaptive Doctor Workload Balancing.
 */
@Service
public class SchedulingEngineService {

    public static final int APPOINTMENT_MINUTES = 20;
    public static final LocalTime DEFAULT_REST_START = LocalTime.of(13, 0);
    public static final LocalTime DEFAULT_REST_END = LocalTime.of(14, 0);
    public static final LocalTime DEFAULT_DAY_START = LocalTime.of(9, 0);
    public static final LocalTime DEFAULT_DAY_END = LocalTime.of(17, 0);

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final DoctorRestPeriodRepository restPeriodRepository;
    private final AppointmentRepository appointmentRepository;

    public SchedulingEngineService(DoctorRepository doctorRepository,
                                   PatientRepository patientRepository,
                                   DoctorAvailabilityRepository availabilityRepository,
                                   DoctorRestPeriodRepository restPeriodRepository,
                                   AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.availabilityRepository = availabilityRepository;
        this.restPeriodRepository = restPeriodRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Checks if a proposed time window overlaps any protected rest period for the doctor.
     */
    public boolean isRestPeriodConflict(Long doctorId, LocalDate date, LocalTime start, LocalTime end) {
        List<DoctorRestPeriod> customRestPeriods = restPeriodRepository.findByDoctorIdAndDate(doctorId, date);
        if (!customRestPeriods.isEmpty()) {
            for (DoctorRestPeriod rest : customRestPeriods) {
                if (start.isBefore(rest.getEndTime()) && end.isAfter(rest.getStartTime())) {
                    return true;
                }
            }
            return false;
        }
        // Fallback default hospital lunch/rest window: 13:00 to 14:00
        return start.isBefore(DEFAULT_REST_END) && end.isAfter(DEFAULT_REST_START);
    }

    /**
     * Retrieves the specific rest period explanation if a conflict exists.
     */
    public String getRestPeriodReason(Long doctorId, LocalDate date, LocalTime start, LocalTime end) {
        List<DoctorRestPeriod> customRestPeriods = restPeriodRepository.findByDoctorIdAndDate(doctorId, date);
        if (!customRestPeriods.isEmpty()) {
            for (DoctorRestPeriod rest : customRestPeriods) {
                if (start.isBefore(rest.getEndTime()) && end.isAfter(rest.getStartTime())) {
                    return "Protected rest period (" + rest.getStartTime() + " - " + rest.getEndTime() +
                            ": " + rest.getReason() + ")";
                }
            }
        }
        if (start.isBefore(DEFAULT_REST_END) && end.isAfter(DEFAULT_REST_START)) {
            return "Hospital standard protected rest window (" + DEFAULT_REST_START + " - " + DEFAULT_REST_END + ": Lunch / Rest)";
        }
        return null;
    }

    /**
     * Feature 1: Intelligent Recommendation Engine for a specific doctor.
     */
    public SlotRecommendationResponse recommendSlot(Long doctorId, Long patientId, LocalDate date, LocalTime preferredStartTime) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        if (!doctor.isActive()) throw new BusinessConflictException("Cannot recommend slots for an inactive doctor.");
        if (!patient.isActive()) throw new BusinessConflictException("Cannot recommend slots for a deactivated patient.");
        if (date.isBefore(LocalDate.now())) throw new BusinessConflictException("Appointment date cannot be in the past.");

        SlotRecommendationResponse response = new SlotRecommendationResponse();
        response.setDoctorId(doctorId);
        response.setDoctorName(doctor.getFullName());
        response.setSpecialization(doctor.getSpecialization());
        response.setPatientId(patientId);
        response.setPatientName(patient.getFullName());
        response.setAppointmentDate(date);

        // Calculate doctor workload
        response.setWorkload(calculateDoctorWorkload(doctor, date));

        List<TimeWindow> windows = getDoctorWorkingWindows(doctorId, date);
        if (windows.isEmpty()) {
            response.setExplanation("No working hours configured for Dr. " + doctor.getFullName() + " on " + date + ".");
            response.getRejectedReasons().add("Doctor has no available shifts scheduled for " + date + ".");
            return response;
        }

        List<LocalTime> candidateSlots = new ArrayList<>();
        List<SlotOptionDTO> allValidSlots = new ArrayList<>();

        for (TimeWindow window : windows) {
            LocalTime cursor = window.start;
            while (!cursor.plusMinutes(APPOINTMENT_MINUTES).isAfter(window.end)) {
                LocalTime end = cursor.plusMinutes(APPOINTMENT_MINUTES);
                String rejection = evaluateSlotRejection(doctorId, patientId, date, cursor, end, null);
                if (rejection == null) {
                    allValidSlots.add(new SlotOptionDTO(doctorId, doctor.getFullName(), cursor, end,
                            "Valid 20-min slot inside shift " + window.start + "-" + window.end));
                    candidateSlots.add(cursor);
                } else {
                    if (response.getRejectedReasons().size() < 8 && !response.getRejectedReasons().contains(rejection)) {
                        response.getRejectedReasons().add(cursor + ": " + rejection);
                    }
                }
                cursor = cursor.plusMinutes(APPOINTMENT_MINUTES);
            }
        }

        if (allValidSlots.isEmpty()) {
            response.setExplanation("No valid 20-minute slots available on " + date + ". All slots in working hours are either booked or in protected rest periods.");
            return response;
        }

        // Deterministic Ranking:
        // Factor 1: If preferred start time provided, pick the slot >= preferredStartTime with minimal distance.
        // Factor 2: If no preferred time, pick the earliest valid slot in the doctor's shift.
        SlotOptionDTO bestSlot;
        if (preferredStartTime != null) {
            bestSlot = allValidSlots.stream()
                    .min(Comparator.comparingInt(s -> {
                        int diff = (int) java.time.Duration.between(preferredStartTime, s.getStartTime()).toMinutes();
                        return diff >= 0 ? diff : Math.abs(diff) + 1000; // Prefer forward slots over past
                    }))
                    .orElse(allValidSlots.get(0));
            response.getRankingFactors().add("Preferred time match: closest valid 20-minute slot to requested " + preferredStartTime);
        } else {
            bestSlot = allValidSlots.get(0);
            response.getRankingFactors().add("Earliest available 20-minute slot during shift");
        }

        response.getRankingFactors().add("Duration: exactly " + APPOINTMENT_MINUTES + " minutes (backend enforced)");
        response.getRankingFactors().add("Doctor scheduled workload: " + response.getWorkload().getScheduledAppointmentsCount() + " appointments (" + response.getWorkload().getScheduledMinutes() + " mins scheduled)");

        response.setRecommendedStart(bestSlot.getStartTime());
        response.setRecommendedEnd(bestSlot.getEndTime());
        response.setExplanation("Recommended Dr. " + doctor.getFullName() + " at " + bestSlot.getStartTime() + " - " + bestSlot.getEndTime() +
                ". Reason: Inside working hours, avoids protected rest periods, zero booking collision, and satisfies all 20-minute slot boundaries.");

        // Add alternatives
        List<SlotOptionDTO> alternatives = new ArrayList<>();
        for (SlotOptionDTO slot : allValidSlots) {
            if (!slot.getStartTime().equals(bestSlot.getStartTime()) && alternatives.size() < 5) {
                alternatives.add(slot);
            }
        }
        response.setAlternativeSlots(alternatives);

        return response;
    }

    /**
     * Feature 3: Adaptive Doctor Workload Balancing across all doctors in a specialization.
     */
    public SlotRecommendationResponse recommendWorkloadBalancedSlot(String specialization, Long patientId, LocalDate date, LocalTime preferredStartTime) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));
        if (!patient.isActive()) throw new BusinessConflictException("Cannot recommend slots for a deactivated patient.");
        if (date.isBefore(LocalDate.now())) throw new BusinessConflictException("Appointment date cannot be in the past.");

        List<Doctor> eligibleDoctors = doctorRepository.findAll(null, specialization, true);
        if (eligibleDoctors.isEmpty()) {
            throw new ResourceNotFoundException("No active doctors found with specialization: " + specialization);
        }

        List<SlotRecommendationResponse> doctorRecommendations = new ArrayList<>();
        for (Doctor doc : eligibleDoctors) {
            SlotRecommendationResponse rec = recommendSlot(doc.getDoctorId(), patientId, date, preferredStartTime);
            if (rec.getRecommendedStart() != null) {
                doctorRecommendations.add(rec);
            }
        }

        if (doctorRecommendations.isEmpty()) {
            SlotRecommendationResponse empty = new SlotRecommendationResponse();
            empty.setSpecialization(specialization);
            empty.setPatientId(patientId);
            empty.setPatientName(patient.getFullName());
            empty.setAppointmentDate(date);
            empty.setExplanation("No eligible doctors in " + specialization + " have available 20-minute slots on " + date + ".");
            empty.getRejectedReasons().add("All " + eligibleDoctors.size() + " doctors in " + specialization + " are fully booked or on rest.");
            return empty;
        }

        // Rank by least workload (scheduled appointments count), then by earliest slot time
        doctorRecommendations.sort(Comparator
                .comparingInt((SlotRecommendationResponse r) -> r.getWorkload() != null ? r.getWorkload().getScheduledAppointmentsCount() : 999)
                .thenComparing(SlotRecommendationResponse::getRecommendedStart)
        );

        SlotRecommendationResponse chosen = doctorRecommendations.get(0);
        chosen.getRankingFactors().add(0, "Workload Balancing: Selected Dr. " + chosen.getDoctorName() +
                " as least loaded (" + chosen.getWorkload().getScheduledAppointmentsCount() + " appointments scheduled on " + date + ")");
        chosen.setExplanation("Workload-Balanced Recommendation: Dr. " + chosen.getDoctorName() +
                " has the lowest scheduled workload (" + chosen.getWorkload().getScheduledAppointmentsCount() +
                " consultations, " + chosen.getWorkload().getScheduledMinutes() + " mins) and an available 20-minute slot at " +
                chosen.getRecommendedStart() + " - " + chosen.getRecommendedEnd() + ".");

        return chosen;
    }

    /**
     * Timeline Generator for Doctor Schedule Visualization.
     */
    public DoctorTimelineResponse getDoctorTimeline(Long doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));

        DoctorTimelineResponse timeline = new DoctorTimelineResponse();
        timeline.setDoctorId(doctorId);
        timeline.setDoctorName(doctor.getFullName());
        timeline.setSpecialization(doctor.getSpecialization());
        timeline.setTimelineDate(date);

        List<TimeWindow> workingWindows = getDoctorWorkingWindows(doctorId, date);
        List<Appointment> existingAppointments = appointmentRepository.findScheduledByDoctorAndDate(doctorId, date);

        LocalTime dayStart = LocalTime.of(8, 0);
        LocalTime dayEnd = LocalTime.of(18, 0);

        LocalTime cursor = dayStart;
        int total = 0, available = 0, booked = 0, rest = 0;

        while (!cursor.plusMinutes(APPOINTMENT_MINUTES).isAfter(dayEnd)) {
            LocalTime slotEnd = cursor.plusMinutes(APPOINTMENT_MINUTES);
            total++;

            // 1. Is it inside working windows?
            boolean insideHours = false;
            for (TimeWindow w : workingWindows) {
                if (!cursor.isBefore(w.start) && !slotEnd.isAfter(w.end)) {
                    insideHours = true;
                    break;
                }
            }

            // 2. Is it in protected rest?
            String restReason = getRestPeriodReason(doctorId, date, cursor, slotEnd);

            // 3. Is it booked?
            Appointment matchedAppt = null;
            for (Appointment appt : existingAppointments) {
                if (cursor.isBefore(appt.getEndTime()) && slotEnd.isAfter(appt.getStartTime())) {
                    matchedAppt = appt;
                    break;
                }
            }

            String slotType;
            String label;
            String reason = null;
            Long apptId = null;
            String patientName = null;
            boolean canBook = false;

            if (matchedAppt != null) {
                slotType = "BOOKED";
                booked++;
                apptId = matchedAppt.getAppointmentId();
                label = "Booked (Appt #" + apptId + ")";
                reason = matchedAppt.getReasonForVisit();
            } else if (restReason != null) {
                slotType = "REST_PERIOD";
                rest++;
                label = "Protected Rest";
                reason = restReason;
            } else if (!insideHours) {
                slotType = "OUTSIDE_HOURS";
                label = "Off Duty";
                reason = "Outside configured shift hours";
            } else {
                slotType = "AVAILABLE";
                available++;
                label = "Available Slot";
                canBook = !date.isBefore(LocalDate.now());
            }

            timeline.getSlots().add(new DoctorTimelineResponse.TimelineSlotDTO(
                    cursor, slotEnd, slotType, apptId, patientName, label, reason, canBook
            ));

            cursor = cursor.plusMinutes(APPOINTMENT_MINUTES);
        }

        timeline.setTotalSlots(total);
        timeline.setAvailableSlots(available);
        timeline.setBookedSlots(booked);
        timeline.setRestSlots(rest);

        return timeline;
    }

    /**
     * Calculates actual scheduled workload using database appointment records.
     */
    public DoctorWorkloadDTO calculateDoctorWorkload(Doctor doctor, LocalDate date) {
        int count = appointmentRepository.countScheduledByDoctorAndDate(doctor.getDoctorId(), date);
        int scheduledMins = count * APPOINTMENT_MINUTES;

        List<TimeWindow> windows = getDoctorWorkingWindows(doctor.getDoctorId(), date);
        int totalPossibleSlots = 0;
        for (TimeWindow w : windows) {
            int durationMins = (int) java.time.Duration.between(w.start, w.end).toMinutes();
            totalPossibleSlots += (durationMins / APPOINTMENT_MINUTES);
        }

        return new DoctorWorkloadDTO(
                doctor.getDoctorId(),
                doctor.getFullName(),
                doctor.getSpecialization(),
                date,
                count,
                scheduledMins,
                totalPossibleSlots
        );
    }

    public List<DoctorWorkloadDTO> getWorkloadOverview(LocalDate date) {
        List<Doctor> doctors = doctorRepository.findAll(null, null, true);
        List<DoctorWorkloadDTO> list = new ArrayList<>();
        for (Doctor doc : doctors) {
            list.add(calculateDoctorWorkload(doc, date));
        }
        return list;
    }

    public String evaluateSlotRejection(Long doctorId, Long patientId, LocalDate date,
                                        LocalTime start, LocalTime end, Long excludeAppointmentId) {
        String restReason = getRestPeriodReason(doctorId, date, start, end);
        if (restReason != null) {
            return restReason;
        }
        if (appointmentRepository.hasOverlap(doctorId, date, start, end, excludeAppointmentId)) {
            return "Doctor already has another active appointment in this time window.";
        }
        if (patientId != null && appointmentRepository.hasPatientOverlap(patientId, date, start, end, excludeAppointmentId)) {
            return "Patient already has a conflicting appointment booked in this time window.";
        }
        return null;
    }

    public List<TimeWindow> getDoctorWorkingWindows(Long doctorId, LocalDate date) {
        List<DoctorAvailability> avails = availabilityRepository.findByDoctorIdAndDate(doctorId, date);
        List<TimeWindow> windows = new ArrayList<>();
        if (!avails.isEmpty()) {
            for (DoctorAvailability a : avails) {
                windows.add(new TimeWindow(a.getStartTime(), a.getEndTime()));
            }
        } else {
            // If doctor has any configured availability for this specific date in database, use it.
            // If none configured, fallback to standard hospital outpatient shift: 09:00 - 17:00
            if (!availabilityRepository.hasAnyAvailabilityConfigured(doctorId, date)) {
                windows.add(new TimeWindow(DEFAULT_DAY_START, DEFAULT_DAY_END));
            }
        }
        return windows;
    }

    public static class TimeWindow {
        public final LocalTime start;
        public final LocalTime end;
        public TimeWindow(LocalTime start, LocalTime end) {
            this.start = start;
            this.end = end;
        }
    }
}
