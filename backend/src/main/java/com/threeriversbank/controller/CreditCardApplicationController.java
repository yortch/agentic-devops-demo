package com.threeriversbank.controller;

import com.threeriversbank.model.dto.CreditCardApplicationRequest;
import com.threeriversbank.model.dto.CreditCardApplicationResponse;
import com.threeriversbank.service.CreditCardApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Applications", description = "Apply for Three Rivers Bank Business Credit Cards")
public class CreditCardApplicationController {

    private final CreditCardApplicationService applicationService;

    @PostMapping
    @Operation(summary = "Submit a credit card application",
            description = "Submit a new business credit card application")
    public ResponseEntity<CreditCardApplicationResponse> submitApplication(
            @Valid @RequestBody CreditCardApplicationRequest request) {
        log.info("POST /api/applications - Submitting application for card id: {}", request.getCardId());
        CreditCardApplicationResponse response = applicationService.submitApplication(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/reference/{referenceNumber}")
    @Operation(summary = "Get application by reference number",
            description = "Look up an application status by its reference number")
    public ResponseEntity<CreditCardApplicationResponse> getApplicationByReference(
            @PathVariable String referenceNumber) {
        log.info("GET /api/applications/reference/{}", referenceNumber);
        CreditCardApplicationResponse response = applicationService.getApplicationByReference(referenceNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get applications by email",
            description = "Look up all applications for a given email address")
    public ResponseEntity<List<CreditCardApplicationResponse>> getApplicationsByEmail(
            @RequestParam String email) {
        log.info("GET /api/applications?email={}", email);
        List<CreditCardApplicationResponse> responses = applicationService.getApplicationsByEmail(email);
        return ResponseEntity.ok(responses);
    }
}
