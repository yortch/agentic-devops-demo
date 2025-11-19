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
public class BillingDto {
    private String billingId;
    private LocalDate statementDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal minimumPayment;
    private String status;
}
