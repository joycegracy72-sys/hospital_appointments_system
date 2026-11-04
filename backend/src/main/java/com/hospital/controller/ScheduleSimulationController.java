package com.hospital.controller;

import com.hospital.dto.request.ScheduleSimulationRequest;
import com.hospital.dto.response.ApiResponse;
import com.hospital.dto.response.ScheduleSimulationResponse;
import com.hospital.service.ScheduleSimulationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/simulation")
public class ScheduleSimulationController {

    private final ScheduleSimulationService simulationService;

    public ScheduleSimulationController(ScheduleSimulationService simulationService) {
        this.simulationService = simulationService;
    }

    /**
     * In-memory What-If preview simulation without database mutation.
     */
    @PostMapping("/preview")
    public ResponseEntity<ApiResponse<ScheduleSimulationResponse>> previewSimulation(
            @Valid @RequestBody ScheduleSimulationRequest request) {
        ScheduleSimulationResponse preview = simulationService.previewSimulation(request);
        return ResponseEntity.ok(ApiResponse.ok("Schedule simulation preview generated", preview));
    }

    /**
     * Confirms and applies safe simulated schedule change (e.g. adding extra rest period).
     */
    @PostMapping("/apply")
    public ResponseEntity<ApiResponse<Void>> applySimulation(
            @Valid @RequestBody ScheduleSimulationRequest request) {
        simulationService.applySimulation(request);
        return ResponseEntity.ok(ApiResponse.ok("Simulated schedule change applied successfully", null));
    }
}
