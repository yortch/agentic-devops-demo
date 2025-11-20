package com.threeriversbank.service;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import com.threeriversbank.repository.BusinessCreditCardApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    
    private final BusinessCreditCardApplicationRepository applicationRepository;
    
    // Simple encryption key for demo purposes - in production use proper key management
    private static final String ENCRYPTION_KEY = "ThreeRiversBank1"; // 16 chars for AES-128
    
    @Transactional
    public ApplicationResponseDto submitApplication(ApplicationRequestDto request) {
        // Validate age (18+)
        LocalDate today = LocalDate.now();
        Period age = Period.between(request.getDateOfBirth(), today);
        if (age.getYears() < 18) {
            throw new IllegalArgumentException("Applicant must be at least 18 years old");
        }
        
        // Create application entity
        BusinessCreditCardApplication application = new BusinessCreditCardApplication();
        application.setApplicationId(generateApplicationId());
        application.setCardId(request.getCardId());
        
        // Business Information
        application.setBusinessLegalName(request.getBusinessLegalName());
        application.setDbaName(request.getDbaName());
        application.setBusinessStructure(request.getBusinessStructure());
        application.setTaxId(encrypt(request.getTaxId()));
        application.setIndustryType(request.getIndustryType());
        application.setYearsInBusiness(request.getYearsInBusiness());
        application.setNumberOfEmployees(request.getNumberOfEmployees());
        application.setAnnualBusinessRevenue(request.getAnnualBusinessRevenue());
        application.setBusinessStreet(request.getBusinessStreet());
        application.setBusinessCity(request.getBusinessCity());
        application.setBusinessState(request.getBusinessState());
        application.setBusinessZip(request.getBusinessZip());
        application.setBusinessPhone(request.getBusinessPhone());
        application.setBusinessWebsite(request.getBusinessWebsite());
        
        // Personal Information
        application.setFirstName(request.getFirstName());
        application.setLastName(request.getLastName());
        application.setDateOfBirth(request.getDateOfBirth());
        application.setSsn(encrypt(request.getSsn()));
        application.setEmail(request.getEmail());
        application.setHomeStreet(request.getHomeStreet());
        application.setHomeCity(request.getHomeCity());
        application.setHomeState(request.getHomeState());
        application.setHomeZip(request.getHomeZip());
        application.setMobilePhone(request.getMobilePhone());
        application.setOwnershipPercentage(request.getOwnershipPercentage());
        application.setTitle(request.getTitle());
        application.setAnnualPersonalIncome(request.getAnnualPersonalIncome());
        
        // Card Preferences
        application.setRequestedCreditLimit(request.getRequestedCreditLimit());
        application.setEmployeeCardsNeeded(request.getEmployeeCardsNeeded());
        application.setAuthorizedUserInfo(request.getAuthorizedUserInfo());
        
        // Terms & Conditions
        application.setAgreedToTerms(request.getAgreedToTerms());
        application.setConsentToCreditCheck(request.getConsentToCreditCheck());
        application.setElectronicSignature(request.getElectronicSignature());
        
        // Application Status
        application.setStatus(BusinessCreditCardApplication.ApplicationStatus.PENDING);
        application.setSubmittedAt(LocalDateTime.now());
        
        // Save application
        applicationRepository.save(application);
        
        // Return response
        return new ApplicationResponseDto(
                application.getApplicationId(),
                application.getStatus().toString(),
                application.getSubmittedAt(),
                "Your application has been successfully submitted.",
                "Decision in 5-7 business days"
        );
    }
    
    private String generateApplicationId() {
        return "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private String encrypt(String data) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(ENCRYPTION_KEY.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encrypted = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }
    
    public String decrypt(String encryptedData) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(ENCRYPTION_KEY.getBytes(), "AES");
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
            return new String(decrypted);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }
}
