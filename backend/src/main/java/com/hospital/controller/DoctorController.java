package com.hospital.controller;

import com.hospital.dto.request.AvailabilityRequest;
import com.hospital.dto.request.DoctorRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.dto.response.DoctorTimelineResponse;
import com.hospital.dto.response.DoctorWorkloadDTO;
import com.hospital.model.Doctor;
import com.hospital.model.DoctorAvailability;
import com.hospital.service.DoctorService;
import com.hospital.service.SchedulingEngineService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    private final DoctorService doctorService;
    private final SchedulingEngineService schedulingEngineService;

    public DoctorController(DoctorService doctorService, SchedulingEngineService schedulingEngineService) {
        this.doctorService = doctorService;
        this.schedulingEngineService = schedulingEngineService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Doctor>>> getAllDoctors(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String specialization,
            @RequestParam(required = false, defaultValue = "false") Boolean activeOnly) {
        List<Doctor> doctors = doctorService.getAllDoctors(search, specialization, activeOnly);
        return ResponseEntity.ok(ApiResponse.ok("Doctors retrieved successfully", doctors));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Doctor>> getDoctorById(@PathVariable Long id) {
        Doctor doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.ok(doctor));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Doctor>> addDoctor(@Valid @RequestBody DoctorRequest request) {
        Doctor created = doctorService.addDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Doctor added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Doctor>> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request) {
        Doctor updated = doctorService.updateDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Doctor details updated successfully", updated));
    }

    @GetMapping("/specializations")
    public ResponseEntity<ApiResponse<List<String>>> getSpecializations() {
        List<String> list = doctorService.getSpecializations();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<List<DoctorAvailability>>> getDoctorAvailability(@PathVariable Long id) {
        List<DoctorAvailability> list = doctorService.getDoctorAvailability(id);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<DoctorAvailability>> addAvailability(
            @PathVariable Long id,
            @Valid @RequestBody AvailabilityRequest request) {
        request.setDoctorId(id);
        DoctorAvailability created = doctorService.addAvailability(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Availability slot added successfully", created));
    }

    @DeleteMapping("/availability/{availabilityId}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable Long availabilityId) {
        doctorService.deleteAvailability(availabilityId);
        return ResponseEntity.ok(ApiResponse.ok("Availability slot deleted successfully", null));
    }

    /**
     * Visual Timeline Generator for a doctor's schedule on a given date (20-min slots).
     */
    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<DoctorTimelineResponse>> getDoctorTimeline(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        DoctorTimelineResponse timeline = schedulingEngineService.getDoctorTimeline(id, date);
        return ResponseEntity.ok(ApiResponse.ok("Doctor schedule timeline generated", timeline));
    }

    /**
     * Workload Overview: Returns scheduled workload counts and metrics across active doctors.
     */
    @GetMapping("/workload")
    public ResponseEntity<ApiResponse<List<DoctorWorkloadDTO>>> getWorkloadOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        List<DoctorWorkloadDTO> list = schedulingEngineService.getWorkloadOverview(targetDate);
        return ResponseEntity.ok(ApiResponse.ok("Doctor workload overview retrieved", list));
    }
}
