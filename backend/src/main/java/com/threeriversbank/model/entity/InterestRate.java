package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "interest_rate")
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
    
    @Column(nullable = false, length = 50)
    private String rateType;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal rateValue;
    
    @Column
    private LocalDate effectiveDate;
    
    @Column(length = 100)
    private String calculationMethod;
}
