package com.hospital.service;

import com.hospital.dto.request.RestPeriodRequest;
import com.hospital.dto.response.RestPeriodResponse;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Appointment;
import com.hospital.model.Doctor;
import com.hospital.model.DoctorRestPeriod;
import com.hospital.repository.DoctorRepository;
import com.hospital.repository.DoctorRestPeriodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorRestPeriodService {

    private final DoctorRestPeriodRepository restPeriodRepository;
    private final DoctorRepository doctorRepository;

    public DoctorRestPeriodService(DoctorRestPeriodRepository restPeriodRepository,
                                   DoctorRepository doctorRepository) {
        this.restPeriodRepository = restPeriodRepository;
        this.doctorRepository = doctorRepository;
    }

    public List<RestPeriodResponse> getRestPeriods(Long doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + doctorId));
        return restPeriodRepository.findAllByDoctorId(doctorId).stream()
                .map(r -> mapToResponse(r, doctor.getFullName()))
                .collect(Collectors.toList());
    }

    @Transactional
    public RestPeriodResponse addRestPeriod(RestPeriodRequest request) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + request.getDoctorId()));

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Rest period end time must be strictly after start time.");
        }

        if (request.getRestDate() != null && request.getRestDate().isBefore(LocalDate.now())) {
            throw new BusinessConflictException("Rest period date cannot be in the past.");
        }

        // 1. Prevent overlapping with another rest period for the same doctor
        boolean overlapRest = restPeriodRepository.hasRestOverlap(
                request.getDoctorId(),
                request.getRestDate(),
                request.getStartTime(),
                request.getEndTime(),
                null
        );
        if (overlapRest) {
            throw new BusinessConflictException("Doctor already has another rest period configured during this time window.");
        }

        // 2. Prevent configuration changes that silently conflict with existing active appointments!
        List<Appointment> conflictingAppointments = restPeriodRepository.findConflictingAppointments(
                request.getDoctorId(),
                request.getRestDate(),
                request.getStartTime(),
                request.getEndTime()
        );
        if (!conflictingAppointments.isEmpty()) {
            Appointment firstConflict = conflictingAppointments.get(0);
            throw new BusinessConflictException("Cannot create rest period: Dr. " + doctor.getFullName() +
                    " already has " + conflictingAppointments.size() + " active appointment(s) scheduled during " +
                    request.getStartTime() + " - " + request.getEndTime() +
                    " (e.g. Appointment #" + firstConflict.getAppointmentId() + " on " + firstConflict.getAppointmentDate() + "). " +
                    "Existing appointments must be rescheduled or cancelled before blocking this time.");
        }

        DoctorRestPeriod restPeriod = new DoctorRestPeriod(
                request.getDoctorId(),
                request.getRestDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getReason() != null ? request.getReason() : "Rest / Lunch Break"
        );

        Long id = restPeriodRepository.save(restPeriod);
        DoctorRestPeriod saved = restPeriodRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Failed to load saved rest period"));

        return mapToResponse(saved, doctor.getFullName());
    }

    @Transactional
    public void deleteRestPeriod(Long restId) {
        DoctorRestPeriod existing = restPeriodRepository.findById(restId)
                .orElseThrow(() -> new ResourceNotFoundException("Rest period not found with ID: " + restId));
        restPeriodRepository.deleteById(restId);
    }

    private RestPeriodResponse mapToResponse(DoctorRestPeriod r, String doctorName) {
        RestPeriodResponse res = new RestPeriodResponse();
        res.setRestId(r.getRestId());
        res.setDoctorId(r.getDoctorId());
        res.setDoctorName(doctorName);
        res.setRestDate(r.getRestDate());
        res.setStartTime(r.getStartTime());
        res.setEndTime(r.getEndTime());
        res.setReason(r.getReason());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}
