package com.threeriversbank.service;

import com.threeriversbank.client.BianApiClient;
import com.threeriversbank.repository.CardFeatureRepository;
import com.threeriversbank.repository.CreditCardRepository;
import com.threeriversbank.repository.FeeScheduleRepository;
import com.threeriversbank.repository.InterestRateRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.mockito.ArgumentMatchers.any;
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
    @Mock
    private Environment environment;

    @Test
    @Timeout(value = 500, unit = TimeUnit.MILLISECONDS)
    void getAllCreditCards_ShouldNotDelay_WhenProductionProfileIsActive() {
        CreditCardService service = new CreditCardService(
                creditCardRepository,
                cardFeatureRepository,
                feeScheduleRepository,
                interestRateRepository,
                bianApiClient,
                environment
        );
        ReflectionTestUtils.setField(service, "chaosDelayEnabled", true);
        ReflectionTestUtils.setField(service, "chaosDelayMs", 2_000L);
        when(environment.acceptsProfiles(any(Profiles.class))).thenReturn(true);
        when(creditCardRepository.findAll()).thenReturn(List.of());

        service.getAllCreditCards();
    }
}
