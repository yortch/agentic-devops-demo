package com.threeriversbank.service;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.BusinessCreditCardApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {
    
    private final BusinessCreditCardApplicationRepository applicationRepository;
    private final CreditCardRepository creditCardRepository;
    private final HttpServletRequest request;
    
    @Transactional
    public ApplicationResponseDto submitApplication(ApplicationRequestDto applicationDto) {
        log.info("Processing application for credit card ID: {}", applicationDto.getCreditCardId());
        
        // Validate credit card exists
        CreditCard creditCard = creditCardRepository.findById(applicationDto.getCreditCardId())
                .orElseThrow(() -> new IllegalArgumentException("Credit card not found with ID: " + applicationDto.getCreditCardId()));
        
        // Validate applicant age (must be 18+)
        validateApplicantAge(applicationDto.getOwnerDateOfBirth());
        
        // Rate limiting check
        validateRateLimit(getClientIp());
        
        // Create application entity
        BusinessCreditCardApplication application = new BusinessCreditCardApplication();
        application.setApplicationNumber(generateApplicationNumber());
        application.setCreditCard(creditCard);
        application.setStatus("Pending");
        application.setSubmittedAt(LocalDateTime.now());
        application.setSubmissionIp(getClientIp());
        
        // Map business information
        application.setBusinessLegalName(applicationDto.getBusinessLegalName());
        application.setDbaName(applicationDto.getDbaName());
        application.setBusinessStructure(applicationDto.getBusinessStructure());
        application.setTaxId(encryptSensitiveData(applicationDto.getTaxId()));
        application.setIndustry(applicationDto.getIndustry());
        application.setYearsInBusiness(applicationDto.getYearsInBusiness());
        application.setNumberOfEmployees(applicationDto.getNumberOfEmployees());
        application.setAnnualBusinessRevenue(applicationDto.getAnnualBusinessRevenue());
        application.setBusinessStreetAddress(applicationDto.getBusinessStreetAddress());
        application.setBusinessCity(applicationDto.getBusinessCity());
        application.setBusinessState(applicationDto.getBusinessState());
        application.setBusinessZip(applicationDto.getBusinessZip());
        application.setBusinessPhone(applicationDto.getBusinessPhone());
        application.setBusinessWebsite(applicationDto.getBusinessWebsite());
        
        // Map personal information
        application.setOwnerFirstName(applicationDto.getOwnerFirstName());
        application.setOwnerLastName(applicationDto.getOwnerLastName());
        application.setOwnerDateOfBirth(applicationDto.getOwnerDateOfBirth());
        application.setOwnerSsn(encryptSensitiveData(applicationDto.getOwnerSsn()));
        application.setOwnerEmail(applicationDto.getOwnerEmail());
        application.setOwnerStreetAddress(applicationDto.getOwnerStreetAddress());
        application.setOwnerCity(applicationDto.getOwnerCity());
        application.setOwnerState(applicationDto.getOwnerState());
        application.setOwnerZip(applicationDto.getOwnerZip());
        application.setOwnerMobilePhone(applicationDto.getOwnerMobilePhone());
        application.setOwnershipPercentage(applicationDto.getOwnershipPercentage());
        application.setOwnerTitle(applicationDto.getOwnerTitle());
        application.setOwnerAnnualIncome(applicationDto.getOwnerAnnualIncome());
        
        // Map card preferences
        application.setRequestedCreditLimit(applicationDto.getRequestedCreditLimit());
        application.setNumberOfEmployeeCards(applicationDto.getNumberOfEmployeeCards());
        application.setAuthorizedUsersJson(applicationDto.getAuthorizedUsersJson());
        
        // Map terms and conditions
        application.setAgreedToTerms(applicationDto.getAgreedToTerms());
        application.setConsentToCreditCheck(applicationDto.getConsentToCreditCheck());
        application.setElectronicSignature(applicationDto.getElectronicSignature());
        
        // Save application
        BusinessCreditCardApplication savedApplication = applicationRepository.save(application);
        log.info("Application submitted successfully: {}", savedApplication.getApplicationNumber());
        
        // Build response
        return ApplicationResponseDto.builder()
                .id(savedApplication.getId())
                .applicationNumber(savedApplication.getApplicationNumber())
                .creditCardId(creditCard.getId())
                .creditCardName(creditCard.getName())
                .status(savedApplication.getStatus())
                .submittedAt(savedApplication.getSubmittedAt())
                .expectedDecisionTimeframe("Decision in 5-7 business days")
                .confirmationMessage("Your application has been submitted successfully. You will receive a confirmation email at " + applicationDto.getOwnerEmail())
                .build();
    }
    
    private void validateApplicantAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            throw new IllegalArgumentException("Date of birth is required");
        }
        
        int age = Period.between(dateOfBirth, LocalDate.now()).getYears();
        if (age < 18) {
            throw new IllegalArgumentException("Applicant must be at least 18 years old");
        }
    }
    
    private void validateRateLimit(String ip) {
        LocalDateTime last24Hours = LocalDateTime.now().minusDays(1);
        Long applicationCount = applicationRepository.countBySubmissionIpAndSubmittedAtAfter(ip, last24Hours);
        
        if (applicationCount >= 3) {
            throw new IllegalStateException("Maximum application limit reached. Please try again later.");
        }
    }
    
    private String generateApplicationNumber() {
        // Format: TRB-YYYYMMDD-XXXXXX (TRB-20260204-123456)
        String datePrefix = LocalDateTime.now().toString().substring(0, 10).replace("-", "");
        int randomSuffix = new Random().nextInt(900000) + 100000; // 6-digit random number
        return "TRB-" + datePrefix + "-" + randomSuffix;
    }
    
    private String encryptSensitiveData(String data) {
        // TODO: Implement proper encryption (AES-256)
        // For now, this is a placeholder that shows only last 4 digits
        // In production, use Spring Security Crypto or similar
        if (data == null || data.length() < 4) {
            return data;
        }
        return "ENCRYPTED:" + data.substring(data.length() - 4);
    }
    
    private String getClientIp() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
