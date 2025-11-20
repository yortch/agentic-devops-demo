package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_schedule")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeeSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "card_id", nullable = false)
    private CreditCard creditCard;
    
    @Column(nullable = false, length = 100)
    private String feeType;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal feeAmount;
    
    @Column(length = 200)
    private String feeDescription;
}
