package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CreditCardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditCardApplicationRepository extends JpaRepository<CreditCardApplication, Long> {
    
    List<CreditCardApplication> findByStatus(String status);
    
    List<CreditCardApplication> findByEmail(String email);
    
    List<CreditCardApplication> findByCreditCardId(Long cardId);
}
