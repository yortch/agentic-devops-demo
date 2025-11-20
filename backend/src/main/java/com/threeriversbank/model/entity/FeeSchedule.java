package com.threeriversbank.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "fee_schedules")
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
    
    @Column(nullable = false)
    private String feeType;
    
    @Column(nullable = false)
    private BigDecimal feeAmount;
    
    private String feeDescription;
}
