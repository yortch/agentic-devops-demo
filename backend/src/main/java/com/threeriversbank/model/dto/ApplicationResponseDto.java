package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponseDto {
    private Long id;
    private String applicationNumber;
    private Long creditCardId;
    private String creditCardName;
    private String status;
    private LocalDateTime submittedAt;
    private String expectedDecisionTimeframe;
    private String confirmationMessage;
}
