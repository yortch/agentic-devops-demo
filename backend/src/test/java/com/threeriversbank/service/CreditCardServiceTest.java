package com.threeriversbank.service;

import com.threeriversbank.client.BianApiClient;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.CardFeatureRepository;
import com.threeriversbank.repository.CreditCardRepository;
import com.threeriversbank.repository.FeeScheduleRepository;
import com.threeriversbank.repository.InterestRateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

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

    private CreditCardService creditCardService;

    @BeforeEach
    void setUp() {
        creditCardService = spy(new CreditCardService(
                creditCardRepository,
                cardFeatureRepository,
                feeScheduleRepository,
                interestRateRepository,
                bianApiClient
        ));
    }

    @Test
    void getAllCreditCards_ShouldNotInjectLatency_WhenChaosDisabled() throws InterruptedException {
        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setName("Business Cash Rewards");
        card.setCardType("Cash Back");
        when(creditCardRepository.findAll()).thenReturn(List.of(card));
        ReflectionTestUtils.setField(creditCardService, "creditCardLatencyChaosEnabled", false);
        ReflectionTestUtils.setField(creditCardService, "creditCardLatencyMaxMs", 9000L);

        creditCardService.getAllCreditCards();

        verify(creditCardService, never()).sleepForChaosLatency(anyLong());
    }

    @Test
    void getAllCreditCards_ShouldInjectLatency_WhenChaosEnabled() throws InterruptedException {
        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setName("Business Cash Rewards");
        card.setCardType("Cash Back");
        when(creditCardRepository.findAll()).thenReturn(List.of(card));
        ReflectionTestUtils.setField(creditCardService, "creditCardLatencyChaosEnabled", true);
        ReflectionTestUtils.setField(creditCardService, "creditCardLatencyMaxMs", 1L);
        doNothing().when(creditCardService).sleepForChaosLatency(anyLong());

        creditCardService.getAllCreditCards();

        verify(creditCardService, times(1)).sleepForChaosLatency(anyLong());
    }

    @Test
    void getAllCreditCards_ShouldInterruptCurrentThread_WhenChaosSleepIsInterrupted() throws InterruptedException {
        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setName("Business Cash Rewards");
        card.setCardType("Cash Back");
        when(creditCardRepository.findAll()).thenReturn(List.of(card));
        ReflectionTestUtils.setField(creditCardService, "creditCardLatencyChaosEnabled", true);
        ReflectionTestUtils.setField(creditCardService, "creditCardLatencyMaxMs", 1L);
        doThrow(new InterruptedException("simulated interruption"))
                .when(creditCardService).sleepForChaosLatency(anyLong());

        Thread.interrupted();
        try {
            creditCardService.getAllCreditCards();
            verify(creditCardService, times(1)).sleepForChaosLatency(anyLong());
            verify(creditCardRepository, times(1)).findAll();
            org.junit.jupiter.api.Assertions.assertTrue(Thread.currentThread().isInterrupted());
        } finally {
            Thread.interrupted();
        }
    }
}
