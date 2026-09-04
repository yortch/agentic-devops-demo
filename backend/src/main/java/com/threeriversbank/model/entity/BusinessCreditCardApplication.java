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
    private String applicationId;

    // Card reference
    @Column(nullable = false)
    private Long creditCardId;

    // Business Information
    @Column(nullable = false, length = 200)
    private String businessLegalName;

    @Column(length = 200)
    private String dbaName;

    @Column(nullable = false, length = 50)
    private String businessStructure;

    @Column(nullable = false, length = 100)
    private String taxId; // stored encrypted

    @Column(nullable = false, length = 100)
    private String industry;

    @Column(nullable = false)
    private Integer yearsInBusiness;

    @Column(nullable = false)
    private Integer numberOfEmployees;

    @Column(nullable = false, length = 50)
    private String annualRevenue;

    @Column(nullable = false, length = 200)
    private String businessStreet;

    @Column(nullable = false, length = 100)
    private String businessCity;

    @Column(nullable = false, length = 2)
    private String businessState;

    @Column(nullable = false, length = 10)
    private String businessZip;

    @Column(nullable = false, length = 20)
    private String businessPhone;

    @Column(length = 255)
    private String businessWebsite;

    // Personal Information
    @Column(nullable = false, length = 100)
    private String ownerFirstName;

    @Column(nullable = false, length = 100)
    private String ownerLastName;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 100)
    private String ssn; // stored encrypted

    @Column(nullable = false, length = 255)
    private String ownerEmail;

    @Column(nullable = false, length = 200)
    private String ownerStreet;

    @Column(nullable = false, length = 100)
    private String ownerCity;

    @Column(nullable = false, length = 2)
    private String ownerState;

    @Column(nullable = false, length = 10)
    private String ownerZip;

    @Column(nullable = false, length = 20)
    private String ownerPhone;

    @Column(nullable = false)
    private Integer ownershipPercentage;

    @Column(nullable = false, length = 100)
    private String ownerTitle;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal annualPersonalIncome;

    // Card Preferences
    @Column(nullable = false, length = 20)
    private String requestedCreditLimit;

    @Column
    private Integer numberOfEmployeeCards;

    // Terms
    @Column(nullable = false)
    private Boolean agreedToTerms;

    @Column(nullable = false)
    private Boolean consentToCreditCheck;

    @Column(nullable = false, length = 200)
    private String electronicSignature;

    // Status
    @Column(nullable = false, length = 20)
    private String status; // Pending, Under Review, Approved, Denied

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @Column(nullable = false, length = 50)
    private String ipAddress;
}
