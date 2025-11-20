package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestRateDto {
    private Long id;
    private String rateType;
    private BigDecimal rateValue;
    private LocalDate effectiveDate;
    private String calculationMethod;
}
