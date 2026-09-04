package com.threeriversbank.controller;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Applications", description = "Three Rivers Bank Credit Card Application API")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    @Operation(summary = "Submit credit card application", description = "Submits a new business credit card application")
    public ResponseEntity<?> submitApplication(
            @Valid @RequestBody ApplicationRequestDto request,
            HttpServletRequest httpRequest) {
        log.info("POST /api/applications - card ID: {}", request.getCreditCardId());
        String ipAddress = getClientIp(httpRequest);
        try {
            ApplicationResponseDto response = applicationService.submitApplication(request, ipAddress);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            log.warn("Rate limit or business rule violation: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
