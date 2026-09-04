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

    private String applicationId;
    private Long id;
    private String status;
    private LocalDateTime submittedAt;
    private String cardName;
    private String ownerFirstName;
    private String ownerLastName;
    private String ownerEmail;
    private String message;
    private String expectedDecisionTimeline;
}
