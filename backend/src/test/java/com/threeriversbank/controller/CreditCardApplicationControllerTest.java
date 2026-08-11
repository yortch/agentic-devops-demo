package com.threeriversbank.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.threeriversbank.model.dto.CreditCardApplicationRequest;
import com.threeriversbank.model.dto.CreditCardApplicationResponse;
import com.threeriversbank.service.CreditCardApplicationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CreditCardApplicationController.class)
class CreditCardApplicationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CreditCardApplicationService applicationService;

    @Autowired
    private ObjectMapper objectMapper;

    private CreditCardApplicationRequest buildValidRequest() {
        return CreditCardApplicationRequest.builder()
                .cardId(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phone("412-555-1234")
                .address("123 Main Street")
                .city("Pittsburgh")
                .state("PA")
                .zipCode("15201")
                .businessName("Doe Enterprises")
                .annualRevenue(new BigDecimal("500000"))
                .yearsInBusiness("3-5 years")
                .build();
    }

    private CreditCardApplicationResponse buildResponse() {
        return CreditCardApplicationResponse.builder()
                .id(1L)
                .cardId(1L)
                .cardName("Business Cash Rewards")
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@example.com")
                .phone("412-555-1234")
                .businessName("Doe Enterprises")
                .status("PENDING")
                .referenceNumber("TRB-1234567890")
                .submittedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void submitApplication_ShouldReturnCreated() throws Exception {
        CreditCardApplicationRequest request = buildValidRequest();
        CreditCardApplicationResponse response = buildResponse();

        when(applicationService.submitApplication(any(CreditCardApplicationRequest.class)))
                .thenReturn(response);

        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.referenceNumber").value("TRB-1234567890"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.cardName").value("Business Cash Rewards"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void submitApplication_WithMissingFields_ShouldReturnBadRequest() throws Exception {
        CreditCardApplicationRequest request = CreditCardApplicationRequest.builder()
                .cardId(1L)
                .build();

        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void submitApplication_WithInvalidEmail_ShouldReturnBadRequest() throws Exception {
        CreditCardApplicationRequest request = buildValidRequest();
        request.setEmail("not-an-email");

        mockMvc.perform(post("/api/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getApplicationByReference_ShouldReturnApplication() throws Exception {
        CreditCardApplicationResponse response = buildResponse();
        when(applicationService.getApplicationByReference(anyString())).thenReturn(response);

        mockMvc.perform(get("/api/applications/reference/TRB-1234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.referenceNumber").value("TRB-1234567890"))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void getApplicationsByEmail_ShouldReturnList() throws Exception {
        CreditCardApplicationResponse response = buildResponse();
        when(applicationService.getApplicationsByEmail(anyString()))
                .thenReturn(Collections.singletonList(response));

        mockMvc.perform(get("/api/applications")
                        .param("email", "john.doe@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].email").value("john.doe@example.com"));
    }
}
