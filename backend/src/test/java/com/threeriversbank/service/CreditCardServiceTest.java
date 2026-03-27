package com.threeriversbank.service;

import com.threeriversbank.client.BianApiClient;
import com.threeriversbank.model.dto.CreditCardDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CreditCardServiceTest {

    @Autowired
    private CreditCardService creditCardService;

    @MockBean
    private BianApiClient bianApiClient;

    @Test
    void getAllCreditCards_shouldCompleteWithin500ms() {
        long startNs = System.nanoTime();
        List<CreditCardDto> cards = creditCardService.getAllCreditCards();
        long elapsedMs = (System.nanoTime() - startNs) / 1_000_000;

        assertThat(cards).isNotEmpty();
        assertThat(elapsedMs)
                .as("GET /api/cards must complete in under 500ms (was %dms)", elapsedMs)
                .isLessThan(500L);
    }
}
