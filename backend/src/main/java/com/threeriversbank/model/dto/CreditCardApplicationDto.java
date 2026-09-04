package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplicationDto {
    
    private Long id;
    private Long cardId;
    
    // Business Information
    private String businessName;
    private String businessLegalName;
    private String businessType;
    private String taxId;
    private String businessIndustry;
    private BigDecimal annualRevenue;
    private Integer yearsInBusiness;
    private String businessAddress;
    private String businessCity;
    private String businessState;
    private String businessZipCode;
    private String businessPhone;
    
    // Personal Information
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String homeAddress;
    private String city;
    private String state;
    private String zipCode;
    private String ssn;
    private LocalDateTime dateOfBirth;
    private BigDecimal annualIncome;
    
    // Application Metadata
    private String status;
    private LocalDateTime applicationDate;
    private LocalDateTime reviewedDate;
    private String notes;
}
