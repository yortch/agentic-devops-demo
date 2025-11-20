package com.threeriversbank.repository;

import com.threeriversbank.model.entity.InterestRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterestRateRepository extends JpaRepository<InterestRate, Long> {
    List<InterestRate> findByCreditCardId(Long cardId);
}
