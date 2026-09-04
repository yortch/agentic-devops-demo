package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_card_application")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private CreditCard creditCard;
    
    // Business Information
    @Column(nullable = false, length = 200)
    private String businessName;
    
    @Column(nullable = false, length = 100)
    private String businessLegalName;
    
    @Column(nullable = false, length = 50)
    private String businessType; // LLC, Corporation, Sole Proprietorship, etc.
    
    @Column(nullable = false, length = 20)
    private String taxId; // EIN or SSN
    
    @Column(nullable = false, length = 50)
    private String businessIndustry;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal annualRevenue;
    
    @Column(nullable = false)
    private Integer yearsInBusiness;
    
    @Column(nullable = false, length = 200)
    private String businessAddress;
    
    @Column(nullable = false, length = 100)
    private String businessCity;
    
    @Column(nullable = false, length = 2)
    private String businessState;
    
    @Column(nullable = false, length = 10)
    private String businessZipCode;
    
    @Column(nullable = false, length = 20)
    private String businessPhone;
    
    // Personal Information (Primary Business Owner)
    @Column(nullable = false, length = 100)
    private String firstName;
    
    @Column(nullable = false, length = 100)
    private String lastName;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false, length = 20)
    private String phoneNumber;
    
    @Column(nullable = false, length = 200)
    private String homeAddress;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(nullable = false, length = 2)
    private String state;
    
    @Column(nullable = false, length = 10)
    private String zipCode;
    
    @Column(nullable = false, length = 11)
    private String ssn; // Last 4 digits or full (encrypted)
    
    @Column(nullable = false)
    private LocalDateTime dateOfBirth;
    
    @Column(precision = 15, scale = 2)
    private BigDecimal annualIncome;
    
    // Application Metadata
    @Column(nullable = false, length = 50)
    private String status; // PENDING, APPROVED, REJECTED, UNDER_REVIEW
    
    @Column(nullable = false)
    private LocalDateTime applicationDate;
    
    @Column
    private LocalDateTime reviewedDate;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @PrePersist
    protected void onCreate() {
        applicationDate = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}
