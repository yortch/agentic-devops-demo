package com.threeriversbank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.threeriversbank.model.dto.CreditCardApplicationDto;
import com.threeriversbank.service.CreditCardApplicationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
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
    private CreditCardApplicationService applicationService;

    private CreditCardApplicationDto testApplicationDto;

    @BeforeEach
    void setUp() {
        testApplicationDto = CreditCardApplicationDto.builder()
                .cardId(1L)
                .businessName("Test Business LLC")
                .businessLegalName("Test Business Legal LLC")
                .businessType("LLC")
                .taxId("12-3456789")
                .businessIndustry("Technology")
                .annualRevenue(new BigDecimal("500000"))
                .yearsInBusiness(5)
                .businessAddress("123 Business St")
                .businessCity("Pittsburgh")
                .businessState("PA")
                .businessZipCode("15212")
                .businessPhone("412-555-0123")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@testbusiness.com")
                .phoneNumber("412-555-0124")
                .homeAddress("456 Home Ave")
                .city("Pittsburgh")
                .state("PA")
                .zipCode("15213")
                .ssn("****5678")
                .dateOfBirth(LocalDateTime.of(1980, 1, 1, 0, 0))
                .annualIncome(new BigDecimal("100000"))
                .build();
    }

    @Test
    void testSubmitApplication_Success() throws Exception {
        CreditCardApplicationDto savedDto = CreditCardApplicationDto.builder()
                .id(1L)
                .cardId(1L)
                .businessName(testApplicationDto.getBusinessName())
                .firstName(testApplicationDto.getFirstName())
                .lastName(testApplicationDto.getLastName())
                .email(testApplicationDto.getEmail())
                .status("PENDING")
                .applicationDate(LocalDateTime.now())
                .build();

        when(applicationService.submitApplication(any(CreditCardApplicationDto.class)))
                .thenReturn(savedDto);

        mockMvc.perform(post("/api/cards/1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testApplicationDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.cardId").value(1))
                .andExpect(jsonPath("$.businessName").value("Test Business LLC"))
                .andExpect(jsonPath("$.email").value("john.doe@testbusiness.com"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void testSubmitApplication_InvalidCardId() throws Exception {
        when(applicationService.submitApplication(any(CreditCardApplicationDto.class)))
                .thenThrow(new IllegalArgumentException("Credit card not found"));

        mockMvc.perform(post("/api/cards/999/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(testApplicationDto)))
                .andExpect(status().isBadRequest());
    }
}
