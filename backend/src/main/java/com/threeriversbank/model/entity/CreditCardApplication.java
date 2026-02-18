package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "credit_card_application", indexes = {
        @Index(name = "idx_credit_card_application_tracking_id", columnList = "tracking_id", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_id", nullable = false, unique = true, length = 36)
    private String trackingId;

    @Column(name = "credit_card_id", nullable = false)
    private Long creditCardId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "credit_card_id", nullable = false, insertable = false, updatable = false)
    private CreditCard creditCard;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 25)
    private String phone;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Column(nullable = false, length = 200)
    private String homeStreet;

    @Column(nullable = false, length = 100)
    private String homeCity;

    @Column(nullable = false, length = 50)
    private String homeState;

    @Column(nullable = false, length = 20)
    private String homeZipCode;

    @Column(nullable = false, length = 200)
    private String businessLegalName;

    @Column(nullable = false, length = 200)
    private String businessStreet;

    @Column(nullable = false, length = 100)
    private String businessCity;

    @Column(nullable = false, length = 50)
    private String businessState;

    @Column(nullable = false, length = 20)
    private String businessZipCode;

    @Column(nullable = false, length = 100)
    private String businessType;

    @Column(nullable = false)
    private Integer yearsInBusiness;

    @Column(length = 4)
    private String taxIdLast4;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal annualPersonalIncome;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal annualBusinessRevenue;

    @Column(nullable = false, length = 100)
    private String employmentStatus;

    @Column(length = 150)
    private String employerName;

    @Column(length = 100)
    private String jobTitle;

    private Integer yearsEmployed;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (trackingId == null || trackingId.isBlank()) {
            trackingId = UUID.randomUUID().toString();
        }
        if (status == null) {
            status = ApplicationStatus.SUBMITTED;
        }
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
