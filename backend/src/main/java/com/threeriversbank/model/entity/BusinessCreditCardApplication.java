package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "business_credit_card_application")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BusinessCreditCardApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String applicationNumber;
    
    @ManyToOne
    @JoinColumn(name = "credit_card_id", nullable = false)
    private CreditCard creditCard;
    
    // Business Information
    @Column(nullable = false, length = 200)
    private String businessLegalName;
    
    @Column(length = 200)
    private String dbaName;
    
    @Column(nullable = false, length = 50)
    private String businessStructure; // Sole Proprietorship, LLC, Corporation, Partnership, Non-Profit
    
    @Column(nullable = false, length = 255)
    private String taxId; // Encrypted - stores encrypted value
    
    @Column(nullable = false, length = 100)
    private String industry;
    
    @Column(nullable = false)
    private Integer yearsInBusiness;
    
    @Column(nullable = false)
    private Integer numberOfEmployees;
    
    @Column(nullable = false, length = 50)
    private String annualBusinessRevenue;
    
    @Column(nullable = false, length = 200)
    private String businessStreetAddress;
    
    @Column(nullable = false, length = 100)
    private String businessCity;
    
    @Column(nullable = false, length = 2)
    private String businessState;
    
    @Column(nullable = false, length = 10)
    private String businessZip;
    
    @Column(nullable = false, length = 20)
    private String businessPhone;
    
    @Column(length = 200)
    private String businessWebsite;
    
    // Personal Information (Business Owner)
    @Column(nullable = false, length = 100)
    private String ownerFirstName;
    
    @Column(nullable = false, length = 100)
    private String ownerLastName;
    
    @Column(nullable = false)
    private LocalDate ownerDateOfBirth;
    
    @Column(nullable = false, length = 255)
    private String ownerSsn; // Encrypted - stores encrypted value
    
    @Column(nullable = false, length = 150)
    private String ownerEmail;
    
    @Column(nullable = false, length = 200)
    private String ownerStreetAddress;
    
    @Column(nullable = false, length = 100)
    private String ownerCity;
    
    @Column(nullable = false, length = 2)
    private String ownerState;
    
    @Column(nullable = false, length = 10)
    private String ownerZip;
    
    @Column(nullable = false, length = 20)
    private String ownerMobilePhone;
    
    @Column(nullable = false)
    private Integer ownershipPercentage;
    
    @Column(nullable = false, length = 100)
    private String ownerTitle;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal ownerAnnualIncome;
    
    // Card Preferences
    @Column(nullable = false, length = 20)
    private String requestedCreditLimit; // $5k, $10k, $25k, $50k, $100k+
    
    @Column
    private Integer numberOfEmployeeCards;
    
    @Column(columnDefinition = "TEXT")
    private String authorizedUsersJson; // Stored as JSON string
    
    // Terms & Conditions
    @Column(nullable = false)
    private Boolean agreedToTerms;
    
    @Column(nullable = false)
    private Boolean consentToCreditCheck;
    
    @Column(nullable = false, length = 200)
    private String electronicSignature;
    
    // Application Status
    @Column(nullable = false, length = 50)
    private String status; // Pending, Under Review, Approved, Denied
    
    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    @Column
    private LocalDateTime reviewedAt;
    
    @Column(columnDefinition = "TEXT")
    private String reviewNotes;
    
    // Metadata
    @Column(length = 45)
    private String submissionIp;
    
    @Column
    private LocalDateTime lastModifiedAt;
}
