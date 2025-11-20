package com.threeriversbank.model.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRequestDto {
    
    @NotNull(message = "Card ID is required")
    private Long cardId;
    
    // Business Information
    @NotBlank(message = "Business legal name is required")
    @Size(max = 200, message = "Business legal name must not exceed 200 characters")
    private String businessLegalName;
    
    @Size(max = 200, message = "DBA name must not exceed 200 characters")
    private String dbaName;
    
    @NotBlank(message = "Business structure is required")
    private String businessStructure;
    
    @NotBlank(message = "Tax ID/EIN is required")
    @Pattern(regexp = "^\\d{9}$", message = "Tax ID must be 9 digits")
    private String taxId;
    
    @NotBlank(message = "Industry type is required")
    private String industryType;
    
    @NotNull(message = "Years in business is required")
    @Min(value = 0, message = "Years in business must be 0 or greater")
    private Integer yearsInBusiness;
    
    @NotNull(message = "Number of employees is required")
    @Min(value = 0, message = "Number of employees must be 0 or greater")
    private Integer numberOfEmployees;
    
    @NotBlank(message = "Annual business revenue is required")
    private String annualBusinessRevenue;
    
    @NotBlank(message = "Business street address is required")
    private String businessStreet;
    
    @NotBlank(message = "Business city is required")
    private String businessCity;
    
    @NotBlank(message = "Business state is required")
    @Size(min = 2, max = 2, message = "State must be 2 characters")
    private String businessState;
    
    @NotBlank(message = "Business ZIP code is required")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
    private String businessZip;
    
    @NotBlank(message = "Business phone is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String businessPhone;
    
    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$", message = "Invalid URL format")
    private String businessWebsite;
    
    // Personal Information
    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;
    
    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    @NotBlank(message = "SSN is required")
    @Pattern(regexp = "^\\d{9}$", message = "SSN must be 9 digits")
    private String ssn;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Home street address is required")
    private String homeStreet;
    
    @NotBlank(message = "Home city is required")
    private String homeCity;
    
    @NotBlank(message = "Home state is required")
    @Size(min = 2, max = 2, message = "State must be 2 characters")
    private String homeState;
    
    @NotBlank(message = "Home ZIP code is required")
    @Pattern(regexp = "^\\d{5}(-\\d{4})?$", message = "Invalid ZIP code format")
    private String homeZip;
    
    @NotBlank(message = "Mobile phone is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be 10 digits")
    private String mobilePhone;
    
    @NotNull(message = "Ownership percentage is required")
    @DecimalMin(value = "0.0", message = "Ownership percentage must be between 0 and 100")
    @DecimalMax(value = "100.0", message = "Ownership percentage must be between 0 and 100")
    private BigDecimal ownershipPercentage;
    
    @NotBlank(message = "Title/Position is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    
    @NotNull(message = "Annual personal income is required")
    @DecimalMin(value = "0.0", message = "Annual personal income must be positive")
    private BigDecimal annualPersonalIncome;
    
    // Card Preferences
    @NotBlank(message = "Requested credit limit is required")
    private String requestedCreditLimit;
    
    @Min(value = 0, message = "Employee cards needed must be 0 or greater")
    @Max(value = 50, message = "Employee cards needed must not exceed 50")
    private Integer employeeCardsNeeded;
    
    private String authorizedUserInfo;
    
    // Terms & Conditions
    @NotNull(message = "Agreement to terms is required")
    @AssertTrue(message = "You must agree to the terms and conditions")
    private Boolean agreedToTerms;
    
    @NotNull(message = "Consent to credit check is required")
    @AssertTrue(message = "You must consent to a credit check")
    private Boolean consentToCreditCheck;
    
    @NotBlank(message = "Electronic signature is required")
    private String electronicSignature;
}
