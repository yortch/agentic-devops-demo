package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardDto {
    private Long id;
    private String name;
    private String cardType;
    private BigDecimal annualFee;
    private String introApr;
    private String regularApr;
    private String rewardsRate;
    private String signupBonus;
    private String creditScoreNeeded;
    private BigDecimal foreignTransactionFee;
    private String description;
    private String features;
    private String benefits;
}
