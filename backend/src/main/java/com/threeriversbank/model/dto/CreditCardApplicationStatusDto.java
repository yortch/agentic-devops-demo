package com.threeriversbank.model.dto;

import com.threeriversbank.model.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response payload for tracking application status by tracking identifier.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplicationStatusDto {
    private String trackingId;
    private ApplicationStatus status;
    private LocalDateTime submittedAt;
    private CreditCardSummaryDto creditCardSummary;

    /**
     * Minimal card summary attached to status lookup responses.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreditCardSummaryDto {
        private Long cardId;
        private String cardName;
    }
}
