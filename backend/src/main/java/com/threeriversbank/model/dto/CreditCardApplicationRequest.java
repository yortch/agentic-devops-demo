package com.threeriversbank.model.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplicationRequest {

    @NotNull(message = "Card ID is required")
    private Long cardId;

    @NotBlank(message = "First name is required")
    @Size(max = 100)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}$",
            message = "Please provide a valid phone number")
    private String phone;

    @NotBlank(message = "Address is required")
    @Size(max = 200)
    private String address;

    @NotBlank(message = "City is required")
    @Size(max = 100)
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 2, message = "State must be a 2-letter code")
    private String state;

    @NotBlank(message = "ZIP code is required")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Please provide a valid ZIP code")
    private String zipCode;

    @NotBlank(message = "Business name is required")
    @Size(max = 200)
    private String businessName;

    @NotNull(message = "Annual revenue is required")
    @DecimalMin(value = "0.0", message = "Annual revenue must be positive")
    private BigDecimal annualRevenue;

    @NotBlank(message = "Years in business is required")
    private String yearsInBusiness;
}
