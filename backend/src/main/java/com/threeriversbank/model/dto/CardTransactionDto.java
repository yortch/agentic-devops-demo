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
public class CardTransactionDto {
    private String transactionId;
    private String merchantName;
    private BigDecimal amount;
    private String currency;
    private LocalDateTime transactionDate;
    private String category;
    private String status;
}
