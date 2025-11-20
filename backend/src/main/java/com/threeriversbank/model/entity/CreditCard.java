package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "credit_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCard {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String cardType;
    
    @Column(nullable = false)
    private BigDecimal annualFee;
    
    @Column(nullable = false)
    private String introApr;
    
    @Column(nullable = false)
    private String regularApr;
    
    @Column(nullable = false)
    private String rewardsRate;
    
    private String signupBonus;
    
    private String creditScoreNeeded;
    
    @Column(nullable = false)
    private BigDecimal foreignTransactionFee;
    
    @Column(length = 2000)
    private String description;
    
    @Column(length = 2000)
    private String features;
    
    @Column(length = 2000)
    private String benefits;
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CardFeature> cardFeatures = new ArrayList<>();
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FeeSchedule> feeSchedules = new ArrayList<>();
    
    @OneToMany(mappedBy = "creditCard", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InterestRate> interestRates = new ArrayList<>();
}
