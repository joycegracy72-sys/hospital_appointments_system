package com.hospital.controller;

import com.hospital.dto.request.RestPeriodRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.dto.response.RestPeriodResponse;
import com.hospital.service.DoctorRestPeriodService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorRestPeriodController {

    private final DoctorRestPeriodService restPeriodService;

    public DoctorRestPeriodController(DoctorRestPeriodService restPeriodService) {
        this.restPeriodService = restPeriodService;
    }

    @GetMapping("/{id}/rest-periods")
    public ResponseEntity<ApiResponse<List<RestPeriodResponse>>> getRestPeriods(@PathVariable Long id) {
        List<RestPeriodResponse> list = restPeriodService.getRestPeriods(id);
        return ResponseEntity.ok(ApiResponse.ok("Protected rest periods retrieved successfully", list));
    }

    @PostMapping("/{id}/rest-periods")
    public ResponseEntity<ApiResponse<RestPeriodResponse>> addRestPeriod(
            @PathVariable Long id,
            @Valid @RequestBody RestPeriodRequest request) {
        request.setDoctorId(id);
        RestPeriodResponse created = restPeriodService.addRestPeriod(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Protected rest period created successfully", created));
    }

    @DeleteMapping("/rest-periods/{restId}")
    public ResponseEntity<ApiResponse<Void>> deleteRestPeriod(@PathVariable Long restId) {
        restPeriodService.deleteRestPeriod(restId);
        return ResponseEntity.ok(ApiResponse.ok("Protected rest period removed successfully", null));
    }
}
