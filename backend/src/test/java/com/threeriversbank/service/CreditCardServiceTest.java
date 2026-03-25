package com.threeriversbank.service;

import com.threeriversbank.client.BianApiClient;
import com.threeriversbank.model.dto.CreditCardDto;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CreditCardServiceTest {

    @Mock
    private CreditCardRepository creditCardRepository;

    @Mock
    private CardFeatureRepository cardFeatureRepository;

    @Mock
    private FeeScheduleRepository feeScheduleRepository;

    @Mock
    private InterestRateRepository interestRateRepository;

    @Mock
    private BianApiClient bianApiClient;

    @InjectMocks
    private CreditCardService creditCardService;

    private List<CreditCard> sampleCards;

    @BeforeEach
    void setUp() {
        CreditCard card1 = new CreditCard();
        card1.setId(1L);
        card1.setName("Business Cash Rewards");
        card1.setCardType("Cash Back");
        card1.setAnnualFee(BigDecimal.ZERO);
        card1.setRegularApr("18.99% - 26.99%");
        card1.setRewardsRate(new BigDecimal("2.00"));

        CreditCard card2 = new CreditCard();
        card2.setId(2L);
        card2.setName("Business Travel Rewards");
        card2.setCardType("Travel Rewards");
        card2.setAnnualFee(new BigDecimal("95.00"));
        card2.setRegularApr("19.99% - 27.99%");
        card2.setRewardsRate(new BigDecimal("3.00"));

        sampleCards = Arrays.asList(card1, card2);
    }

    @Test
    void getAllCreditCards_ShouldReturnAllCards() {
        when(creditCardRepository.findAll()).thenReturn(sampleCards);

        List<CreditCardDto> result = creditCardService.getAllCreditCards();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Business Cash Rewards");
        assertThat(result.get(1).getName()).isEqualTo("Business Travel Rewards");
    }

    @Test
    void getAllCreditCards_ShouldCompleteWithinOneSecond() {
        when(creditCardRepository.findAll()).thenReturn(sampleCards);

        long startNs = System.nanoTime();
        List<CreditCardDto> result = creditCardService.getAllCreditCards();
        long elapsedMs = (System.nanoTime() - startNs) / 1_000_000;

        assertThat(result)
                .as("getAllCreditCards() should return all cards")
                .hasSize(2);
        assertThat(elapsedMs)
                .as("getAllCreditCards() must complete within 1 second (no Thread.sleep chaos injection)")
                .isLessThan(1000L);
    }
}
