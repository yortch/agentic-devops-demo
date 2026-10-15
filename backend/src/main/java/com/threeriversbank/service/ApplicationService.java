package com.threeriversbank.service;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.ApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeParseException;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private static final int MAX_APPLICATIONS_PER_DAY = 3;

    @Value("${app.encryption.key:ThreeRiversBank!}")
    private String encryptionKey;

    private final ApplicationRepository applicationRepository;
    private final CreditCardRepository creditCardRepository;

    @Transactional
    public ApplicationResponseDto submitApplication(ApplicationRequestDto request, String ipAddress) {
        log.info("Processing application for card ID: {} from IP: {}", request.getCreditCardId(), ipAddress);

        // Rate limiting check
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        long applicationsToday = applicationRepository.countByIpAddressSince(ipAddress, oneDayAgo);
        if (applicationsToday >= MAX_APPLICATIONS_PER_DAY) {
            log.warn("Rate limit exceeded for IP: {}", ipAddress);
            throw new IllegalStateException("Maximum of " + MAX_APPLICATIONS_PER_DAY + " applications per day exceeded. Please try again tomorrow.");
        }

        // Validate card exists
        CreditCard card = creditCardRepository.findById(request.getCreditCardId())
                .orElseThrow(() -> new IllegalArgumentException("Credit card not found with ID: " + request.getCreditCardId()));

        // Validate age (18+)
        LocalDate dob;
        try {
            dob = LocalDate.parse(request.getDateOfBirth());
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date of birth format. Use YYYY-MM-DD.");
        }
        if (Period.between(dob, LocalDate.now()).getYears() < 18) {
            throw new IllegalArgumentException("Applicant must be at least 18 years old.");
        }

        // Build entity
        BusinessCreditCardApplication application = new BusinessCreditCardApplication();
        application.setApplicationId(generateApplicationId());
        application.setCreditCardId(request.getCreditCardId());

        // Business info
        application.setBusinessLegalName(request.getBusinessLegalName());
        application.setDbaName(request.getDbaName());
        application.setBusinessStructure(request.getBusinessStructure());
        application.setTaxId(encrypt(request.getTaxId()));
        application.setIndustry(request.getIndustry());
        application.setYearsInBusiness(request.getYearsInBusiness());
        application.setNumberOfEmployees(request.getNumberOfEmployees());
        application.setAnnualRevenue(request.getAnnualRevenue());
        application.setBusinessStreet(request.getBusinessStreet());
        application.setBusinessCity(request.getBusinessCity());
        application.setBusinessState(request.getBusinessState());
        application.setBusinessZip(request.getBusinessZip());
        application.setBusinessPhone(request.getBusinessPhone());
        application.setBusinessWebsite(request.getBusinessWebsite());

        // Personal info
        application.setOwnerFirstName(request.getOwnerFirstName());
        application.setOwnerLastName(request.getOwnerLastName());
        application.setDateOfBirth(dob);
        application.setSsn(encrypt(request.getSsn()));
        application.setOwnerEmail(request.getOwnerEmail());
        application.setOwnerStreet(request.getOwnerStreet());
        application.setOwnerCity(request.getOwnerCity());
        application.setOwnerState(request.getOwnerState());
        application.setOwnerZip(request.getOwnerZip());
        application.setOwnerPhone(request.getOwnerPhone());
        application.setOwnershipPercentage(request.getOwnershipPercentage());
        application.setOwnerTitle(request.getOwnerTitle());
        application.setAnnualPersonalIncome(request.getAnnualPersonalIncome());

        // Card preferences
        application.setRequestedCreditLimit(request.getRequestedCreditLimit());
        application.setNumberOfEmployeeCards(request.getNumberOfEmployeeCards());

        // Terms
        application.setAgreedToTerms(request.getAgreedToTerms());
        application.setConsentToCreditCheck(request.getConsentToCreditCheck());
        application.setElectronicSignature(request.getElectronicSignature());

        // Status and metadata
        application.setStatus("Pending");
        application.setSubmittedAt(LocalDateTime.now());
        application.setIpAddress(ipAddress);

        BusinessCreditCardApplication saved = applicationRepository.save(application);
        log.info("Application saved with ID: {}", saved.getApplicationId());

        return ApplicationResponseDto.builder()
                .applicationId(saved.getApplicationId())
                .id(saved.getId())
                .status(saved.getStatus())
                .submittedAt(saved.getSubmittedAt())
                .cardName(card.getName())
                .ownerFirstName(saved.getOwnerFirstName())
                .ownerLastName(saved.getOwnerLastName())
                .ownerEmail(saved.getOwnerEmail())
                .message("Your application has been submitted successfully.")
                .expectedDecisionTimeline("Decision in 5-7 business days")
                .build();
    }

    private String generateApplicationId() {
        return "APP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String encrypt(String data) {
        try {
            byte[] keyBytes = encryptionKey.getBytes(StandardCharsets.UTF_8);
            // Ensure exactly 16 bytes for AES-128
            byte[] paddedKey = new byte[16];
            System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 16));
            SecretKeySpec keySpec = new SecretKeySpec(paddedKey, "AES");
            Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
            byte[] iv = new byte[16];
            new SecureRandom().nextBytes(iv);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, ivSpec);
            byte[] encrypted = cipher.doFinal(data.getBytes(StandardCharsets.UTF_8));
            // Prepend IV to ciphertext for storage
            byte[] ivAndCiphertext = new byte[16 + encrypted.length];
            System.arraycopy(iv, 0, ivAndCiphertext, 0, 16);
            System.arraycopy(encrypted, 0, ivAndCiphertext, 16, encrypted.length);
            return Base64.getEncoder().encodeToString(ivAndCiphertext);
        } catch (Exception e) {
            log.error("Encryption error", e);
            throw new RuntimeException("Failed to encrypt sensitive data", e);
        }
    }
}
