package com.threeriversbank.model.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
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
    @Pattern(regexp = "Sole Proprietorship|LLC|Corporation|Partnership|Non-Profit", 
             message = "Invalid business structure")
    private String businessStructure;
    
    @NotBlank(message = "Tax ID is required")
    @Pattern(regexp = "\\d{9}", message = "Tax ID must be 9 digits")
    private String taxId;
    
    @NotBlank(message = "Industry is required")
    @Size(max = 100, message = "Industry must not exceed 100 characters")
    private String industry;
    
    @NotNull(message = "Years in business is required")
    @Min(value = 0, message = "Years in business must be 0 or greater")
    private Integer yearsInBusiness;
    
    @NotNull(message = "Number of employees is required")
    @Min(value = 1, message = "Number of employees must be at least 1")
    private Integer numberOfEmployees;
    
    @NotBlank(message = "Annual business revenue is required")
    private String annualBusinessRevenue;
    
    @NotBlank(message = "Business street address is required")
    @Size(max = 200, message = "Street address must not exceed 200 characters")
    private String businessStreetAddress;
    
    @NotBlank(message = "Business city is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String businessCity;
    
    @NotBlank(message = "Business state is required")
    @Size(min = 2, max = 2, message = "State must be 2 characters")
    private String businessState;
    
    @NotBlank(message = "Business ZIP code is required")
    @Pattern(regexp = "\\d{5}(-\\d{4})?", message = "Invalid ZIP code format")
    private String businessZip;
    
    @NotBlank(message = "Business phone is required")
    @Pattern(regexp = "\\d{10}|\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4}", 
             message = "Invalid phone number format")
    private String businessPhone;
    
    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$", 
             message = "Invalid URL format")
    private String businessWebsite;
    
    // Personal Information (Business Owner)
    @NotBlank(message = "Owner first name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String ownerFirstName;
    
    @NotBlank(message = "Owner last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String ownerLastName;
    
    @NotNull(message = "Owner date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate ownerDateOfBirth;
    
    @NotBlank(message = "Owner SSN is required")
    @Pattern(regexp = "\\d{9}", message = "SSN must be 9 digits")
    private String ownerSsn;
    
    @NotBlank(message = "Owner email is required")
    @Email(message = "Invalid email format")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String ownerEmail;
    
    @NotBlank(message = "Owner street address is required")
    @Size(max = 200, message = "Street address must not exceed 200 characters")
    private String ownerStreetAddress;
    
    @NotBlank(message = "Owner city is required")
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String ownerCity;
    
    @NotBlank(message = "Owner state is required")
    @Size(min = 2, max = 2, message = "State must be 2 characters")
    private String ownerState;
    
    @NotBlank(message = "Owner ZIP code is required")
    @Pattern(regexp = "\\d{5}(-\\d{4})?", message = "Invalid ZIP code format")
    private String ownerZip;
    
    @NotBlank(message = "Owner mobile phone is required")
    @Pattern(regexp = "\\d{10}|\\d{3}-\\d{3}-\\d{4}|\\(\\d{3}\\) \\d{3}-\\d{4}", 
             message = "Invalid phone number format")
    private String ownerMobilePhone;
    
    @NotNull(message = "Ownership percentage is required")
    @Min(value = 1, message = "Ownership percentage must be at least 1")
    @Max(value = 100, message = "Ownership percentage must not exceed 100")
    private Integer ownershipPercentage;
    
    @NotBlank(message = "Owner title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String ownerTitle;
    
    @NotNull(message = "Owner annual income is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Annual income must be greater than 0")
    private BigDecimal ownerAnnualIncome;
    
    // Card Preferences
    @NotBlank(message = "Requested credit limit is required")
    @Pattern(regexp = "\\$5k|\\$10k|\\$25k|\\$50k|\\$100k\\+", 
             message = "Invalid credit limit selection")
    private String requestedCreditLimit;
    
    @Min(value = 0, message = "Number of employee cards must be 0 or greater")
    @Max(value = 50, message = "Number of employee cards must not exceed 50")
    private Integer numberOfEmployeeCards;
    
    private String authorizedUsersJson;
    
    // Terms & Conditions
    @NotNull(message = "You must agree to terms and conditions")
    @AssertTrue(message = "You must agree to terms and conditions")
    private Boolean agreedToTerms;
    
    @NotNull(message = "You must consent to credit check")
    @AssertTrue(message = "You must consent to credit check")
    private Boolean consentToCreditCheck;
    
    @NotBlank(message = "Electronic signature is required")
    @Size(max = 200, message = "Electronic signature must not exceed 200 characters")
    private String electronicSignature;
}
