package com.threeriversbank.controller;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Tag(name = "Applications", description = "Credit Card Application API")
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    // Simple rate limiting - in production use Redis or proper rate limiting solution
    private final Map<String, Integer> applicationCounts = new ConcurrentHashMap<>();
    private final Map<String, LocalDate> lastApplicationDate = new ConcurrentHashMap<>();
    
    @PostMapping
    @Operation(summary = "Submit credit card application", description = "Submit a new business credit card application")
    public ResponseEntity<?> submitApplication(
            @Valid @RequestBody ApplicationRequestDto request,
            HttpServletRequest httpRequest) {
        
        // Rate limiting: 3 applications per day per IP
        String clientIp = getClientIp(httpRequest);
        LocalDate today = LocalDate.now();
        
        if (lastApplicationDate.getOrDefault(clientIp, LocalDate.MIN).isBefore(today)) {
            applicationCounts.put(clientIp, 0);
            lastApplicationDate.put(clientIp, today);
        }
        
        Integer count = applicationCounts.getOrDefault(clientIp, 0);
        if (count >= 3) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Rate limit exceeded");
            error.put("message", "Maximum 3 applications per day allowed. Please try again tomorrow.");
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
        }
        
        try {
            ApplicationResponseDto response = applicationService.submitApplication(request);
            applicationCounts.put(clientIp, count + 1);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Validation error");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        } else {
            ip = ip.split(",")[0];
        }
        return ip;
    }
}
