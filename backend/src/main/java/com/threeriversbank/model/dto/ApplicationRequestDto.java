package com.threeriversbank.model.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequestDto {

    @NotNull(message = "Credit card ID is required")
    private Long creditCardId;

    // Business Information
    @NotBlank(message = "Business legal name is required")
    @Size(max = 200, message = "Business legal name must not exceed 200 characters")
    private String businessLegalName;

    @Size(max = 200, message = "DBA name must not exceed 200 characters")
    private String dbaName;

    @NotBlank(message = "Business structure is required")
    private String businessStructure;

    @NotBlank(message = "Tax ID is required")
    @Pattern(regexp = "^\\d{9}$", message = "Tax ID must be 9 digits")
    private String taxId;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotNull(message = "Years in business is required")
    @Min(value = 0, message = "Years in business must be non-negative")
    private Integer yearsInBusiness;

    @NotNull(message = "Number of employees is required")
    @Min(value = 1, message = "Number of employees must be at least 1")
    private Integer numberOfEmployees;

    @NotBlank(message = "Annual revenue is required")
    private String annualRevenue;

    @NotBlank(message = "Business street address is required")
    private String businessStreet;

    @NotBlank(message = "Business city is required")
    private String businessCity;

    @NotBlank(message = "Business state is required")
    @Size(min = 2, max = 2, message = "Business state must be 2 characters")
    private String businessState;

    @NotBlank(message = "Business ZIP is required")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Business ZIP must be a valid ZIP code")
    private String businessZip;

    @NotBlank(message = "Business phone is required")
    @Pattern(regexp = "^[\\d\\-\\+\\(\\)\\s]{7,20}$", message = "Business phone must be a valid phone number")
    private String businessPhone;

    @Pattern(regexp = "^$|^https?://[\\w.-]+(?:\\.[\\w.-]+)+[/\\w.-]*$", message = "Business website must be a valid URL")
    private String businessWebsite;

    // Personal Information
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String ownerFirstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String ownerLastName;

    @NotBlank(message = "Date of birth is required")
    private String dateOfBirth; // ISO format: YYYY-MM-DD, validated in service

    @NotBlank(message = "SSN is required")
    @Pattern(regexp = "^\\d{9}$", message = "SSN must be 9 digits")
    private String ssn;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid email address")
    private String ownerEmail;

    @NotBlank(message = "Home street address is required")
    private String ownerStreet;

    @NotBlank(message = "Home city is required")
    private String ownerCity;

    @NotBlank(message = "Home state is required")
    @Size(min = 2, max = 2, message = "Home state must be 2 characters")
    private String ownerState;

    @NotBlank(message = "Home ZIP is required")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Home ZIP must be a valid ZIP code")
    private String ownerZip;

    @NotBlank(message = "Mobile phone is required")
    @Pattern(regexp = "^[\\d\\-\\+\\(\\)\\s]{7,20}$", message = "Mobile phone must be a valid phone number")
    private String ownerPhone;

    @NotNull(message = "Ownership percentage is required")
    @Min(value = 1, message = "Ownership percentage must be at least 1")
    @Max(value = 100, message = "Ownership percentage must not exceed 100")
    private Integer ownershipPercentage;

    @NotBlank(message = "Title/Position is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String ownerTitle;

    @NotNull(message = "Annual personal income is required")
    @DecimalMin(value = "0.00", message = "Annual income must be non-negative")
    private BigDecimal annualPersonalIncome;

    // Card Preferences
    @NotBlank(message = "Requested credit limit is required")
    private String requestedCreditLimit;

    @Min(value = 0, message = "Number of employee cards must be non-negative")
    @Max(value = 50, message = "Number of employee cards must not exceed 50")
    private Integer numberOfEmployeeCards;

    // Terms
    @NotNull(message = "Agreement to terms is required")
    @AssertTrue(message = "You must agree to the terms and conditions")
    private Boolean agreedToTerms;

    @NotNull(message = "Consent to credit check is required")
    @AssertTrue(message = "You must consent to a credit check")
    private Boolean consentToCreditCheck;

    @NotBlank(message = "Electronic signature is required")
    @Size(max = 200, message = "Electronic signature must not exceed 200 characters")
    private String electronicSignature;
}
