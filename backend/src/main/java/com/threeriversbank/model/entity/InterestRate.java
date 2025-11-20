package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "interest_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InterestRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private CreditCard creditCard;
    
    @Column(nullable = false)
    private String rateType;
    
    @Column(nullable = false)
    private BigDecimal rateValue;
    
    private LocalDate effectiveDate;
    
    private String calculationMethod;
}
