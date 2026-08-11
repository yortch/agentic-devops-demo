package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CreditCardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CreditCardApplicationRepository extends JpaRepository<CreditCardApplication, Long> {

    List<CreditCardApplication> findByEmail(String email);

    Optional<CreditCardApplication> findByReferenceNumber(String referenceNumber);

    List<CreditCardApplication> findByCreditCardId(Long cardId);

    List<CreditCardApplication> findByStatus(String status);
}
