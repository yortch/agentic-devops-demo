package com.threeriversbank.controller;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.service.ApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Card Applications", description = "Business credit card application submission API")
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    @PostMapping
    @Operation(summary = "Submit credit card application", 
               description = "Submit a new business credit card application")
    public ResponseEntity<ApplicationResponseDto> submitApplication(
            @Valid @RequestBody ApplicationRequestDto applicationRequest) {
        log.info("Received application for credit card ID: {}", applicationRequest.getCreditCardId());
        
        try {
            ApplicationResponseDto response = applicationService.submitApplication(applicationRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid application data: {}", e.getMessage());
            throw e;
        } catch (IllegalStateException e) {
            log.error("Application submission failed: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error processing application", e);
            throw new RuntimeException("Failed to process application. Please try again later.");
        }
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(errors);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(
            IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }
    
    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
    public ResponseEntity<Map<String, String>> handleIllegalStateException(
            IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(error);
    }
}
