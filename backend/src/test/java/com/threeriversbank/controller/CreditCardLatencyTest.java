package com.threeriversbank.controller;

import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.CreditCardRepository;
import com.threeriversbank.repository.FeeScheduleRepository;
import com.threeriversbank.repository.InterestRateRepository;
import com.threeriversbank.service.CreditCardService;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CreditCardLatencyTest {

    @Test
    void catalogRequestsShouldNotHaveArtificialDelay() {
        CreditCardRepository repository = mock(CreditCardRepository.class);
        CreditCard card = new CreditCard();
        card.setId(1L);
        card.setName("Business Cash Rewards");
        when(repository.findAll()).thenReturn(List.of(card));
        CreditCardService service = new CreditCardService(repository, mock(FeeScheduleRepository.class),
                mock(InterestRateRepository.class));
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new CreditCardController(service)).build();

        assertTimeoutPreemptively(Duration.ofSeconds(2), () -> {
            for (int i = 0; i < 5; i++) {
                mockMvc.perform(get("/api/cards"))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$[0].name").value("Business Cash Rewards"));
            }
        });
    }
}
