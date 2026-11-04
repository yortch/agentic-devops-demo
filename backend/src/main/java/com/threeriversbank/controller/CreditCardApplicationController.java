package com.threeriversbank.controller;

import com.threeriversbank.model.dto.CreditCardApplicationDto;
import com.threeriversbank.service.CreditCardApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards/{cardId}/applications")
@RequiredArgsConstructor
@Slf4j
public class CreditCardApplicationController {
    
    private final CreditCardApplicationService applicationService;
    
    @PostMapping
    public ResponseEntity<CreditCardApplicationDto> submitApplication(
            @PathVariable Long cardId,
            @RequestBody CreditCardApplicationDto applicationDto) {
        
        log.info("Received application request for card ID: {}", cardId);
        
        // Ensure the cardId in the path matches the DTO
        applicationDto.setCardId(cardId);
        
        try {
            CreditCardApplicationDto savedApplication = applicationService.submitApplication(applicationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedApplication);
        } catch (IllegalArgumentException e) {
            log.error("Invalid application request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error processing application", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping
    public ResponseEntity<List<CreditCardApplicationDto>> getApplicationsByCardId(@PathVariable Long cardId) {
        log.info("Fetching applications for card ID: {}", cardId);
        List<CreditCardApplicationDto> applications = applicationService.getApplicationsByCardId(cardId);
        return ResponseEntity.ok(applications);
    }
    
    @GetMapping("/{applicationId}")
    public ResponseEntity<CreditCardApplicationDto> getApplicationById(
            @PathVariable Long cardId,
            @PathVariable Long applicationId) {
        
        log.info("Fetching application ID: {} for card ID: {}", applicationId, cardId);
        
        return applicationService.getApplicationById(applicationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
