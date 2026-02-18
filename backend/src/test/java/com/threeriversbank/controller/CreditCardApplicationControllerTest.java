package com.threeriversbank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.threeriversbank.model.dto.CreditCardApplicationCreateRequestDto;
import com.threeriversbank.model.dto.CreditCardApplicationCreateResponseDto;
import com.threeriversbank.model.dto.CreditCardApplicationStatusDto;
import com.threeriversbank.model.entity.ApplicationStatus;
import com.threeriversbank.service.CreditCardApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CreditCardApplicationController.class)
class CreditCardApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CreditCardApplicationService creditCardApplicationService;

    @Test
    void submitApplication_ShouldReturnCreatedWithTrackingId() throws Exception {
        // Arrange
        CreditCardApplicationCreateResponseDto responseDto = CreditCardApplicationCreateResponseDto.builder()
                .trackingId("b13d8fce-3469-4b35-b38c-ec4d812f55c5")
                .status(ApplicationStatus.SUBMITTED)
                .submittedAt(LocalDateTime.of(2026, 2, 17, 10, 30, 0))
                .creditCardId(1L)
                .build();

        when(creditCardApplicationService.submitApplication(any(CreditCardApplicationCreateRequestDto.class)))
                .thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequestDto())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.trackingId").value("b13d8fce-3469-4b35-b38c-ec4d812f55c5"))
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.submittedAt").value("2026-02-17T10:30:00"))
                .andExpect(jsonPath("$.creditCardId").value(1));
    }

    @Test
    void submitApplication_WithValidationFailure_ShouldReturnBadRequestWithFieldErrors() throws Exception {
        // Arrange
        CreditCardApplicationCreateRequestDto invalidRequest = validRequestDto();
        invalidRequest.setEmail("invalid-email");

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.fieldErrors[0].field").value("email"))
                .andExpect(jsonPath("$.fieldErrors[0].message", containsString("well-formed")));
    }

    @Test
    void submitApplication_WithInvalidCreditCardId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(creditCardApplicationService.submitApplication(any(CreditCardApplicationCreateRequestDto.class)))
                .thenThrow(new NoSuchElementException("Credit card not found with id: 999"));

        // Act & Assert
        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequestDto())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Credit card not found with id: 999"))
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    @Test
    void getApplicationStatus_ShouldReturnOkWithStatus() throws Exception {
        // Arrange
        CreditCardApplicationStatusDto responseDto = CreditCardApplicationStatusDto.builder()
                .trackingId("b13d8fce-3469-4b35-b38c-ec4d812f55c5")
                .status(ApplicationStatus.IN_REVIEW)
                .submittedAt(LocalDateTime.of(2026, 2, 16, 9, 0, 0))
                .creditCardSummary(CreditCardApplicationStatusDto.CreditCardSummaryDto.builder()
                        .cardId(1L)
                        .cardName("Business Cash Rewards")
                        .build())
                .build();

        when(creditCardApplicationService.getApplicationStatus("b13d8fce-3469-4b35-b38c-ec4d812f55c5"))
                .thenReturn(responseDto);

        // Act & Assert
        mockMvc.perform(get("/api/applications/track/b13d8fce-3469-4b35-b38c-ec4d812f55c5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.trackingId").value("b13d8fce-3469-4b35-b38c-ec4d812f55c5"))
                .andExpect(jsonPath("$.status").value("IN_REVIEW"))
                .andExpect(jsonPath("$.submittedAt").value("2026-02-16T09:00:00"))
                .andExpect(jsonPath("$.creditCardSummary.cardId").value(1))
                .andExpect(jsonPath("$.creditCardSummary.cardName").value("Business Cash Rewards"));
    }

    @Test
    void getApplicationStatus_WithInvalidTrackingId_ShouldReturnNotFound() throws Exception {
        // Arrange
        when(creditCardApplicationService.getApplicationStatus("invalid-tracking-id"))
                .thenThrow(new NoSuchElementException("Application not found with trackingId: invalid-tracking-id"));

        // Act & Assert
        mockMvc.perform(get("/api/applications/track/invalid-tracking-id"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Application not found with trackingId: invalid-tracking-id"))
                .andExpect(jsonPath("$.fieldErrors").isArray());
    }

    private CreditCardApplicationCreateRequestDto validRequestDto() {
        return CreditCardApplicationCreateRequestDto.builder()
                .creditCardId(1L)
                .firstName("Jane")
                .lastName("Doe")
                .email("jane.doe@example.com")
                .phone("4125551234")
                .dateOfBirth(LocalDate.of(1990, 1, 15))
                .homeAddress(CreditCardApplicationCreateRequestDto.AddressDto.builder()
                        .street("123 Main St")
                        .city("Pittsburgh")
                        .state("PA")
                        .zipCode("15222")
                        .build())
                .businessLegalName("Doe Consulting LLC")
                .businessAddress(CreditCardApplicationCreateRequestDto.AddressDto.builder()
                        .street("456 Market St")
                        .city("Pittsburgh")
                        .state("PA")
                        .zipCode("15219")
                        .build())
                .businessType("Consulting")
                .yearsInBusiness(4)
                .taxIdLast4("1234")
                .annualPersonalIncome(new BigDecimal("95000.00"))
                .annualBusinessRevenue(new BigDecimal("250000.00"))
                .employmentStatus("Self-Employed")
                .employerName("Doe Consulting LLC")
                .jobTitle("Owner")
                .yearsEmployed(4)
                .build();
    }
}