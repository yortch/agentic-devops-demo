package com.threeriversbank.model.dto;

import com.threeriversbank.model.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response payload returned after successfully submitting a credit card application.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplicationCreateResponseDto {
    private String trackingId;
    private ApplicationStatus status;
    private LocalDateTime submittedAt;
    private Long creditCardId;
}
