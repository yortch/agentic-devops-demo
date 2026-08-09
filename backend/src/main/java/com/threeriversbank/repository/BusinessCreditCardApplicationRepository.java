package com.threeriversbank.repository;

import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusinessCreditCardApplicationRepository extends JpaRepository<BusinessCreditCardApplication, Long> {
    
    Optional<BusinessCreditCardApplication> findByApplicationNumber(String applicationNumber);
    
    List<BusinessCreditCardApplication> findByStatus(String status);
    
    List<BusinessCreditCardApplication> findByOwnerEmail(String email);
    
    List<BusinessCreditCardApplication> findBySubmittedAtBetween(LocalDateTime start, LocalDateTime end);
    
    Long countBySubmissionIpAndSubmittedAtAfter(String ip, LocalDateTime since);
}
