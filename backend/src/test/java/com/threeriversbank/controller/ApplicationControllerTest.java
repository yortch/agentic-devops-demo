package com.threeriversbank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.service.ApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApplicationController.class)
@DisplayName("Application Controller Tests")
class ApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApplicationService applicationService;

    private ApplicationRequestDto validRequest;
    private ApplicationResponseDto mockResponse;

    @BeforeEach
    void setUp() {
        validRequest = ApplicationRequestDto.builder()
                .creditCardId(1L)
                .businessLegalName("Test Business LLC")
                .businessStructure("LLC")
                .taxId("123456789")
                .industry("Technology")
                .yearsInBusiness(5)
                .numberOfEmployees(10)
                .annualBusinessRevenue("$500,000 - $1,000,000")
                .businessStreetAddress("123 Main St")
                .businessCity("Pittsburgh")
                .businessState("PA")
                .businessZip("15201")
                .businessPhone("4125551234")
                .ownerFirstName("John")
                .ownerLastName("Doe")
                .ownerDateOfBirth(LocalDate.of(1985, 1, 1))
                .ownerSsn("987654321")
                .ownerEmail("john.doe@test.com")
                .ownerStreetAddress("456 Oak Ave")
                .ownerCity("Pittsburgh")
                .ownerState("PA")
                .ownerZip("15202")
                .ownerMobilePhone("4125555678")
                .ownershipPercentage(100)
                .ownerTitle("CEO")
                .ownerAnnualIncome(new BigDecimal("150000"))
                .requestedCreditLimit("$25k")
                .numberOfEmployeeCards(5)
                .agreedToTerms(true)
                .consentToCreditCheck(true)
                .electronicSignature("John Doe")
                .build();

        mockResponse = ApplicationResponseDto.builder()
                .id(1L)
                .applicationNumber("TRB-20260204-123456")
                .creditCardId(1L)
                .creditCardName("Business Cash Rewards")
                .status("Pending")
                .submittedAt(LocalDateTime.now())
                .expectedDecisionTimeframe("Decision in 5-7 business days")
                .confirmationMessage("Your application has been submitted successfully.")
                .build();
    }

    @Test
    @DisplayName("POST /api/applications should create application successfully")
    void submitApplication_withValidData_shouldReturn201() throws Exception {
        // Arrange
        when(applicationService.submitApplication(any(ApplicationRequestDto.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.applicationNumber").value("TRB-20260204-123456"))
                .andExpect(jsonPath("$.creditCardName").value("Business Cash Rewards"))
                .andExpect(jsonPath("$.status").value("Pending"))
                .andExpect(jsonPath("$.expectedDecisionTimeframe").value("Decision in 5-7 business days"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when business name is missing")
    void submitApplication_withMissingBusinessName_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setBusinessLegalName(null);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.businessLegalName").exists());
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when email format is invalid")
    void submitApplication_withInvalidEmail_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setOwnerEmail("invalid-email");

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.ownerEmail").value("Invalid email format"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when Tax ID format is invalid")
    void submitApplication_withInvalidTaxId_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setTaxId("12345"); // Too short

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.taxId").value("Tax ID must be 9 digits"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when SSN format is invalid")
    void submitApplication_withInvalidSSN_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setOwnerSsn("123"); // Too short

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.ownerSsn").value("SSN must be 9 digits"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when ZIP code format is invalid")
    void submitApplication_withInvalidZipCode_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setBusinessZip("ABCDE");

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.businessZip").value("Invalid ZIP code format"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when terms not agreed")
    void submitApplication_withoutTermsAgreement_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setAgreedToTerms(false);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.agreedToTerms").value("You must agree to terms and conditions"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when credit check consent not given")
    void submitApplication_withoutCreditCheckConsent_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setConsentToCreditCheck(false);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.consentToCreditCheck").value("You must consent to credit check"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when ownership percentage exceeds 100")
    void submitApplication_withInvalidOwnershipPercentage_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setOwnershipPercentage(150);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.ownershipPercentage").value("Ownership percentage must not exceed 100"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when business structure is invalid")
    void submitApplication_withInvalidBusinessStructure_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setBusinessStructure("InvalidType");

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.businessStructure").value("Invalid business structure"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when card not found")
    void submitApplication_withNonExistentCard_shouldReturn400() throws Exception {
        // Arrange
        when(applicationService.submitApplication(any(ApplicationRequestDto.class)))
                .thenThrow(new IllegalArgumentException("Credit card not found with ID: 999"));

        validRequest.setCreditCardId(999L);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Credit card not found with ID: 999"));
    }

    @Test
    @DisplayName("POST /api/applications should return 429 when rate limit exceeded")
    void submitApplication_whenRateLimitExceeded_shouldReturn429() throws Exception {
        // Arrange
        when(applicationService.submitApplication(any(ApplicationRequestDto.class)))
                .thenThrow(new IllegalStateException("Maximum application limit reached. Please try again later."));

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Maximum application limit reached. Please try again later."));
    }

    @Test
    @DisplayName("POST /api/applications should accept valid 5-digit ZIP code")
    void submitApplication_withFiveDigitZip_shouldSucceed() throws Exception {
        // Arrange
        validRequest.setBusinessZip("15201");
        validRequest.setOwnerZip("15202");
        
        when(applicationService.submitApplication(any(ApplicationRequestDto.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/applications should accept valid 9-digit ZIP code")
    void submitApplication_withNineDigitZip_shouldSucceed() throws Exception {
        // Arrange
        validRequest.setBusinessZip("15201-1234");
        validRequest.setOwnerZip("15202-5678");
        
        when(applicationService.submitApplication(any(ApplicationRequestDto.class)))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when years in business is negative")
    void submitApplication_withNegativeYearsInBusiness_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setYearsInBusiness(-1);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.yearsInBusiness").value("Years in business must be 0 or greater"));
    }

    @Test
    @DisplayName("POST /api/applications should return 400 when annual income is not provided")
    void submitApplication_withoutAnnualIncome_shouldReturn400() throws Exception {
        // Arrange
        validRequest.setOwnerAnnualIncome(null);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.ownerAnnualIncome").value("Owner annual income is required"));
    }
}
