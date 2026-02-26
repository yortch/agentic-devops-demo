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

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 200)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 2)
    private String state;

    @Column(nullable = false, length = 10)
    private String zipCode;

    @Column(nullable = false, length = 200)
    private String businessName;

    @Column(precision = 15, scale = 2)
    private BigDecimal annualRevenue;

    @Column(nullable = false, length = 50)
    private String yearsInBusiness;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 36)
    private String referenceNumber;

    @Column(nullable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        if (referenceNumber == null) {
            referenceNumber = "TRB-" + System.currentTimeMillis();
        }
    }
}
