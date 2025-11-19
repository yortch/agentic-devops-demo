package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeeScheduleDto {
    private Long id;
    private String feeType;
    private BigDecimal feeAmount;
    private String feeDescription;
}
