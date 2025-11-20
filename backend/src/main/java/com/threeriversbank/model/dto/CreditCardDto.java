package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardDto {
    private Long id;
    private String name;
    private String cardType;
    private BigDecimal annualFee;
    private String introApr;
    private String regularApr;
    private BigDecimal rewardsRate;
    private String signupBonus;
    private String creditScoreNeeded;
    private BigDecimal foreignTransactionFee;
    private String description;
    private String features;
    private String benefits;
    private List<CardFeatureDto> cardFeatures;
    private List<FeeScheduleDto> feeSchedules;
    private List<InterestRateDto> interestRates;
}
