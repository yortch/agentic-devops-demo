package com.threeriversbank.controller;

import com.threeriversbank.model.dto.CreditCardApplicationCreateRequestDto;
import com.threeriversbank.model.dto.CreditCardApplicationCreateResponseDto;
import com.threeriversbank.model.dto.CreditCardApplicationStatusDto;
import com.threeriversbank.service.CreditCardApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Applications", description = "Credit card application submission and tracking API")
public class CreditCardApplicationController {

    private final CreditCardApplicationService creditCardApplicationService;

    @PostMapping
    @Operation(summary = "Submit credit card application", description = "Submits a new credit card application and returns a tracking ID")
    public ResponseEntity<CreditCardApplicationCreateResponseDto> submitApplication(
            @Valid @RequestBody CreditCardApplicationCreateRequestDto requestDto) {
        log.info("POST /api/applications - submitting application for cardId: {}", requestDto.getCreditCardId());
        CreditCardApplicationCreateResponseDto responseDto = creditCardApplicationService.submitApplication(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    @GetMapping("/track/{trackingId}")
    @Operation(summary = "Track application status", description = "Returns status and card summary for a submitted application")
    public ResponseEntity<CreditCardApplicationStatusDto> getApplicationStatus(@PathVariable String trackingId) {
        log.info("GET /api/applications/track/{}", trackingId);
        CreditCardApplicationStatusDto responseDto = creditCardApplicationService.getApplicationStatus(trackingId);
        return ResponseEntity.ok(responseDto);
    }
}