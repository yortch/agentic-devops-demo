package com.threeriversbank.service;

import com.threeriversbank.model.dto.CreditCardApplicationDto;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.model.entity.CreditCardApplication;
import com.threeriversbank.repository.CreditCardApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardApplicationService {
    
    private final CreditCardApplicationRepository applicationRepository;
    private final CreditCardRepository creditCardRepository;
    
    @Transactional
    public CreditCardApplicationDto submitApplication(CreditCardApplicationDto dto) {
        log.info("Processing credit card application for card ID: {}", dto.getCardId());
        
        // Validate that the credit card exists
        CreditCard creditCard = creditCardRepository.findById(dto.getCardId())
                .orElseThrow(() -> new IllegalArgumentException("Credit card not found with ID: " + dto.getCardId()));
        
        // Convert DTO to entity
        CreditCardApplication application = convertToEntity(dto, creditCard);
        
        // Save the application
        CreditCardApplication savedApplication = applicationRepository.save(application);
        
        log.info("Credit card application submitted successfully with ID: {}", savedApplication.getId());
        
        return convertToDto(savedApplication);
    }
    
    public Optional<CreditCardApplicationDto> getApplicationById(Long id) {
        return applicationRepository.findById(id)
                .map(this::convertToDto);
    }
    
    public List<CreditCardApplicationDto> getApplicationsByEmail(String email) {
        return applicationRepository.findByEmail(email)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<CreditCardApplicationDto> getApplicationsByCardId(Long cardId) {
        return applicationRepository.findByCreditCardId(cardId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<CreditCardApplicationDto> getApplicationsByStatus(String status) {
        return applicationRepository.findByStatus(status)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private CreditCardApplication convertToEntity(CreditCardApplicationDto dto, CreditCard creditCard) {
        CreditCardApplication application = new CreditCardApplication();
        
        application.setCreditCard(creditCard);
        
        // Business Information
        application.setBusinessName(dto.getBusinessName());
        application.setBusinessLegalName(dto.getBusinessLegalName());
        application.setBusinessType(dto.getBusinessType());
        application.setTaxId(dto.getTaxId());
        application.setBusinessIndustry(dto.getBusinessIndustry());
        application.setAnnualRevenue(dto.getAnnualRevenue());
        application.setYearsInBusiness(dto.getYearsInBusiness());
        application.setBusinessAddress(dto.getBusinessAddress());
        application.setBusinessCity(dto.getBusinessCity());
        application.setBusinessState(dto.getBusinessState());
        application.setBusinessZipCode(dto.getBusinessZipCode());
        application.setBusinessPhone(dto.getBusinessPhone());
        
        // Personal Information
        application.setFirstName(dto.getFirstName());
        application.setLastName(dto.getLastName());
        application.setEmail(dto.getEmail());
        application.setPhoneNumber(dto.getPhoneNumber());
        application.setHomeAddress(dto.getHomeAddress());
        application.setCity(dto.getCity());
        application.setState(dto.getState());
        application.setZipCode(dto.getZipCode());
        application.setSsn(dto.getSsn());
        application.setDateOfBirth(dto.getDateOfBirth());
        application.setAnnualIncome(dto.getAnnualIncome());
        
        return application;
    }
    
    private CreditCardApplicationDto convertToDto(CreditCardApplication application) {
        return CreditCardApplicationDto.builder()
                .id(application.getId())
                .cardId(application.getCreditCard().getId())
                
                // Business Information
                .businessName(application.getBusinessName())
                .businessLegalName(application.getBusinessLegalName())
                .businessType(application.getBusinessType())
                .taxId(application.getTaxId())
                .businessIndustry(application.getBusinessIndustry())
                .annualRevenue(application.getAnnualRevenue())
                .yearsInBusiness(application.getYearsInBusiness())
                .businessAddress(application.getBusinessAddress())
                .businessCity(application.getBusinessCity())
                .businessState(application.getBusinessState())
                .businessZipCode(application.getBusinessZipCode())
                .businessPhone(application.getBusinessPhone())
                
                // Personal Information
                .firstName(application.getFirstName())
                .lastName(application.getLastName())
                .email(application.getEmail())
                .phoneNumber(application.getPhoneNumber())
                .homeAddress(application.getHomeAddress())
                .city(application.getCity())
                .state(application.getState())
                .zipCode(application.getZipCode())
                .ssn(application.getSsn())
                .dateOfBirth(application.getDateOfBirth())
                .annualIncome(application.getAnnualIncome())
                
                // Application Metadata
                .status(application.getStatus())
                .applicationDate(application.getApplicationDate())
                .reviewedDate(application.getReviewedDate())
                .notes(application.getNotes())
                
                .build();
    }
}
