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
public class CreditCardApplicationResponse {

    private Long id;
    private Long cardId;
    private String cardName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String businessName;
    private String status;
    private String referenceNumber;
    private LocalDateTime submittedAt;
}
