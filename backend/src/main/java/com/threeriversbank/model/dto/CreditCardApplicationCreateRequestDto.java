package com.threeriversbank.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Request payload for submitting a new credit card application.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditCardApplicationCreateRequestDto {

    /**
     * Identifier of the credit card product the customer is applying for.
     */
    @NotNull
    @Positive
    private Long creditCardId;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(max = 25)
    private String phone;

    @NotNull
    @Past
    private LocalDate dateOfBirth;

    @NotNull
    @Valid
    private AddressDto homeAddress;

    @NotBlank
    @Size(max = 200)
    private String businessLegalName;

    @NotNull
    @Valid
    private AddressDto businessAddress;

    @NotBlank
    @Size(max = 100)
    private String businessType;

    @NotNull
    @PositiveOrZero
    private Integer yearsInBusiness;

    @Pattern(regexp = "^\\d{4}$", message = "taxIdLast4 must be exactly 4 digits")
    private String taxIdLast4;

    @NotNull
    @Positive
    private BigDecimal annualPersonalIncome;

    @NotNull
    @Positive
    private BigDecimal annualBusinessRevenue;

    @NotBlank
    @Size(max = 100)
    private String employmentStatus;

    @Size(max = 150)
    private String employerName;

    @Size(max = 100)
    private String jobTitle;

    @PositiveOrZero
    private Integer yearsEmployed;

    /**
     * Reusable address object for home and business address details.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {

        @NotBlank
        @Size(max = 200)
        private String street;

        @NotBlank
        @Size(max = 100)
        private String city;

        @NotBlank
        @Size(max = 50)
        private String state;

        @NotBlank
        @Size(max = 20)
        private String zipCode;
    }
}
