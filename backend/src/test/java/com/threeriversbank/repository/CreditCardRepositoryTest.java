package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CreditCard;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CreditCardRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CreditCardRepository creditCardRepository;

    @Test
    void findAll_ShouldReturnAllCards() {
        // Act
        List<CreditCard> cards = creditCardRepository.findAll();

        // Assert
        assertThat(cards).isNotEmpty();
        assertThat(cards).hasSize(5); // We have 5 cards in data.sql
    }

    @Test
    void findByCardType_ShouldReturnFilteredCards() {
        // Act
        List<CreditCard> cashBackCards = creditCardRepository.findByCardType("Cash Back");

        // Assert
        assertThat(cashBackCards).isNotEmpty();
        assertThat(cashBackCards).allMatch(card -> card.getCardType().equals("Cash Back"));
    }

    @Test
    void findCardsWithNoAnnualFee_ShouldReturnFreeCards() {
        // Act
        List<CreditCard> freeCards = creditCardRepository.findCardsWithNoAnnualFee();

        // Assert
        assertThat(freeCards).isNotEmpty();
        assertThat(freeCards).allMatch(card -> 
            card.getAnnualFee().compareTo(BigDecimal.ZERO) == 0
        );
    }

    @Test
    void findCardsWithRewards_ShouldReturnRewardsCards() {
        // Act
        List<CreditCard> rewardsCards = creditCardRepository.findCardsWithRewards();

        // Assert
        assertThat(rewardsCards).isNotEmpty();
        assertThat(rewardsCards).allMatch(card -> 
            card.getRewardsRate().compareTo(BigDecimal.ZERO) > 0
        );
    }

    @Test
    void findById_ShouldReturnCard() {
        // Act
        var card = creditCardRepository.findById(1L);

        // Assert
        assertThat(card).isPresent();
        assertThat(card.get().getName()).isEqualTo("Business Cash Rewards");
    }
}
