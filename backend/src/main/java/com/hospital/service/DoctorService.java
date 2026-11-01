package com.hospital.service;

import com.hospital.dto.request.AvailabilityRequest;
import com.hospital.dto.request.DoctorRequest;
import com.hospital.exception.BusinessConflictException;
import com.hospital.exception.ResourceNotFoundException;
import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.repository.DoctorAvailabilityRepository;
import com.hospital.repository.DoctorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final DoctorAvailabilityRepository availabilityRepository;

    public DoctorService(DoctorRepository doctorRepository, DoctorAvailabilityRepository availabilityRepository) {
        this.doctorRepository = doctorRepository;
        this.availabilityRepository = availabilityRepository;
    }

    public List<Doctor> getAllDoctors(String search, String specialization, Boolean activeOnly) {
        return doctorRepository.findAll(search, specialization, activeOnly);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with ID: " + id));
    }

    @Transactional
    public Doctor addDoctor(DoctorRequest request) {
        doctorRepository.findByEmail(request.getEmail().trim()).ifPresent(d -> {
            throw new BusinessConflictException("A doctor with email " + request.getEmail() + " already exists");
        });

        Doctor doctor = new Doctor();
        doctor.setFirstName(request.getFirstName().trim());
        doctor.setLastName(request.getLastName().trim());
        doctor.setSpecialization(request.getSpecialization().trim());
        doctor.setEmail(request.getEmail().trim().toLowerCase());
        doctor.setPhone(request.getPhone().trim());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setActive(true);

        Long newId = doctorRepository.save(doctor);
        return getDoctorById(newId);
    }

    @Transactional
    public Doctor updateDoctor(Long id, DoctorRequest request) {
        Doctor existing = getDoctorById(id);

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!existing.getEmail().equalsIgnoreCase(newEmail)) {
            doctorRepository.findByEmail(newEmail).ifPresent(d -> {
                if (!d.getDoctorId().equals(id)) {
                    throw new BusinessConflictException("Email " + newEmail + " is already in use by another doctor");
                }
            });
        }

        existing.setFirstName(request.getFirstName().trim());
        existing.setLastName(request.getLastName().trim());
        existing.setSpecialization(request.getSpecialization().trim());
        existing.setEmail(newEmail);
        existing.setPhone(request.getPhone().trim());
        existing.setConsultationFee(request.getConsultationFee());

        doctorRepository.update(id, existing);
        return getDoctorById(id);
    }

    public List<String> getSpecializations() {
        return doctorRepository.findDistinctSpecializations();
    }

    public List<DoctorAvailability> getDoctorAvailability(Long doctorId) {
        getDoctorById(doctorId); // Ensure doctor exists
        return availabilityRepository.findByDoctorId(doctorId);
    }

    @Transactional
    public DoctorAvailability addAvailability(AvailabilityRequest request) {
        getDoctorById(request.getDoctorId());

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Slot end time must be strictly after start time");
        }

        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctorId(request.getDoctorId());
        availability.setAvailableDate(request.getAvailableDate());
        availability.setStartTime(request.getStartTime());
        availability.setEndTime(request.getEndTime());

        Long newId = availabilityRepository.save(availability);
        availability.setAvailabilityId(newId);
        return availability;
    }

    @Transactional
    public void deleteAvailability(Long availabilityId) {
        availabilityRepository.delete(availabilityId);
    }
}
