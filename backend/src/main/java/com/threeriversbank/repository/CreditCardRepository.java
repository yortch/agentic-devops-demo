package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CreditCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardRepository extends JpaRepository<CreditCard, Long> {
    
    List<CreditCard> findByCardType(String cardType);
    
    @Query("SELECT c FROM CreditCard c WHERE c.annualFee = 0")
    List<CreditCard> findCardsWithNoAnnualFee();
    
    @Query("SELECT c FROM CreditCard c WHERE c.rewardsRate > 0")
    List<CreditCard> findCardsWithRewards();
}
