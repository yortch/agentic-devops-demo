package com.threeriversbank.controller;

import com.threeriversbank.model.dto.CreditCardDto;
import com.threeriversbank.service.CreditCardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CreditCardController.class)
class CreditCardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CreditCardService creditCardService;

    @Test
    void getAllCards_ShouldReturnListOfCards() throws Exception {
        // Arrange
        CreditCardDto card1 = CreditCardDto.builder()
                .id(1L)
                .name("Business Cash Rewards")
                .cardType("Cash Back")
                .annualFee(BigDecimal.ZERO)
                .regularApr("18.99% - 26.99%")
                .rewardsRate(new BigDecimal("2.00"))
                .build();

        CreditCardDto card2 = CreditCardDto.builder()
                .id(2L)
                .name("Business Travel Rewards")
                .cardType("Travel Rewards")
                .annualFee(new BigDecimal("95.00"))
                .regularApr("19.99% - 27.99%")
                .rewardsRate(new BigDecimal("3.00"))
                .build();

        List<CreditCardDto> cards = Arrays.asList(card1, card2);
        when(creditCardService.getAllCreditCards()).thenReturn(cards);

        // Act & Assert
        mockMvc.perform(get("/api/cards"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Business Cash Rewards"))
                .andExpect(jsonPath("$[1].name").value("Business Travel Rewards"));
    }

    @Test
    void getCardById_ShouldReturnCard() throws Exception {
        // Arrange
        CreditCardDto card = CreditCardDto.builder()
                .id(1L)
                .name("Business Cash Rewards")
                .cardType("Cash Back")
                .annualFee(BigDecimal.ZERO)
                .regularApr("18.99% - 26.99%")
                .rewardsRate(new BigDecimal("2.00"))
                .build();

        when(creditCardService.getCreditCardById(anyLong())).thenReturn(card);

        // Act & Assert
        mockMvc.perform(get("/api/cards/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Business Cash Rewards"))
                .andExpect(jsonPath("$.cardType").value("Cash Back"));
    }

    @Test
    void getCardFees_ShouldReturnFeeSchedule() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/cards/1/fees"))
                .andExpect(status().isOk());
    }

    @Test
    void getCardInterestRates_ShouldReturnInterestRates() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/cards/1/interest"))
                .andExpect(status().isOk());
    }

    @Test
    void getCardTransactions_ShouldReturnTransactions() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/cards/1/transactions"))
                .andExpect(status().isOk());
    }
}
