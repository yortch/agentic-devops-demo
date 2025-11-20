package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_credit_card_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessCreditCardApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String applicationId;
    
    @Column(nullable = false)
    private Long cardId;
    
    // Business Information
    @Column(nullable = false)
    private String businessLegalName;
    
    private String dbaName;
    
    @Column(nullable = false)
    private String businessStructure;
    
    @Column(nullable = false)
    private String taxId;
    
    @Column(nullable = false)
    private String industryType;
    
    @Column(nullable = false)
    private Integer yearsInBusiness;
    
    @Column(nullable = false)
    private Integer numberOfEmployees;
    
    @Column(nullable = false)
    private String annualBusinessRevenue;
    
    @Column(nullable = false)
    private String businessStreet;
    
    @Column(nullable = false)
    private String businessCity;
    
    @Column(nullable = false)
    private String businessState;
    
    @Column(nullable = false)
    private String businessZip;
    
    @Column(nullable = false)
    private String businessPhone;
    
    private String businessWebsite;
    
    // Personal Information
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(nullable = false)
    private LocalDate dateOfBirth;
    
    @Column(nullable = false)
    private String ssn;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false)
    private String homeStreet;
    
    @Column(nullable = false)
    private String homeCity;
    
    @Column(nullable = false)
    private String homeState;
    
    @Column(nullable = false)
    private String homeZip;
    
    @Column(nullable = false)
    private String mobilePhone;
    
    @Column(nullable = false)
    private BigDecimal ownershipPercentage;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private BigDecimal annualPersonalIncome;
    
    // Card Preferences
    @Column(nullable = false)
    private String requestedCreditLimit;
    
    private Integer employeeCardsNeeded;
    
    private String authorizedUserInfo;
    
    // Terms & Conditions
    @Column(nullable = false)
    private Boolean agreedToTerms;
    
    @Column(nullable = false)
    private Boolean consentToCreditCheck;
    
    @Column(nullable = false)
    private String electronicSignature;
    
    // Application Status
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    private LocalDateTime reviewedAt;
    
    private LocalDateTime decisionAt;
    
    private String decisionNotes;
    
    public enum ApplicationStatus {
        PENDING,
        UNDER_REVIEW,
        APPROVED,
        DENIED
    }
}
