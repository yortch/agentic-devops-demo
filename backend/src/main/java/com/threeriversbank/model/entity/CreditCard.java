package com.threeriversbank.model.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "credit_card")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, length = 50)
    private String cardType;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal annualFee;
    
    @Column(length = 50)
    private String introApr;
    
    @Column(length = 50)
    private String regularApr;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal rewardsRate;
    
    @Column(length = 200)
    private String signupBonus;
    
    @Column(length = 50)
    private String creditScoreNeeded;
    
    @Column(precision = 5, scale = 2)
    private BigDecimal foreignTransactionFee;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String features;
    
    @Column(columnDefinition = "TEXT")
    private String benefits;
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CardFeature> cardFeatures = new ArrayList<>();
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeeSchedule> feeSchedules = new ArrayList<>();
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InterestRate> interestRates = new ArrayList<>();
}
