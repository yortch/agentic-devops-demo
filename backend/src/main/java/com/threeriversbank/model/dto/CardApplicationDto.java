package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardApplicationDto {
    private Long id;
    private String applicantName;
    private String email;
    private String phone;
    private String businessName;
    private String businessTaxId;
    private BigDecimal annualRevenue;
    private Long cardId;
    private String status;
    private LocalDateTime submittedAt;
}
