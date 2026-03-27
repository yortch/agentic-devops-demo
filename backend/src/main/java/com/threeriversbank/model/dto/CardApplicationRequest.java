package com.threeriversbank.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardApplicationRequest {
    
    @NotBlank(message = "Applicant name is required")
    private String applicantName;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;
    
    @NotBlank(message = "Phone is required")
    private String phone;
    
    @NotBlank(message = "Business name is required")
    private String businessName;
    
    @NotBlank(message = "Business Tax ID is required")
    private String businessTaxId;
    
    @NotNull(message = "Annual revenue is required")
    @Positive(message = "Annual revenue must be positive")
    private BigDecimal annualRevenue;
}
