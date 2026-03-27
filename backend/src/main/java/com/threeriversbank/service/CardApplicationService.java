package com.threeriversbank.service;

import com.threeriversbank.model.dto.CardApplicationDto;
import com.threeriversbank.model.dto.CardApplicationRequest;
import com.threeriversbank.model.entity.CardApplication;
import com.threeriversbank.repository.CardApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CardApplicationService {
    
    private final CardApplicationRepository applicationRepository;
    private final CreditCardRepository creditCardRepository;
    
    @Transactional
    public CardApplicationDto submitApplication(Long cardId, CardApplicationRequest request) {
        log.info("Submitting application for card ID: {}, applicant: {}", cardId, request.getApplicantName());
        
        // Verify card exists
        creditCardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Credit card not found with id: " + cardId));
        
        // Create application entity
        CardApplication application = new CardApplication();
        application.setCardId(cardId);
        application.setApplicantName(request.getApplicantName());
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setBusinessName(request.getBusinessName());
        application.setBusinessTaxId(request.getBusinessTaxId());
        application.setAnnualRevenue(request.getAnnualRevenue());
        
        // Save application
        CardApplication savedApplication = applicationRepository.save(application);
        log.info("Application submitted successfully with ID: {}", savedApplication.getId());
        
        // Convert to DTO
        return convertToDto(savedApplication);
    }
    
    @Transactional(readOnly = true)
    public CardApplicationDto getApplicationById(Long id) {
        log.info("Retrieving application with ID: {}", id);
        CardApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + id));
        return convertToDto(application);
    }
    
    private CardApplicationDto convertToDto(CardApplication application) {
        return CardApplicationDto.builder()
                .id(application.getId())
                .applicantName(application.getApplicantName())
                .email(application.getEmail())
                .phone(application.getPhone())
                .businessName(application.getBusinessName())
                .businessTaxId(application.getBusinessTaxId())
                .annualRevenue(application.getAnnualRevenue())
                .cardId(application.getCardId())
                .status(application.getStatus())
                .submittedAt(application.getSubmittedAt())
                .build();
    }
}
