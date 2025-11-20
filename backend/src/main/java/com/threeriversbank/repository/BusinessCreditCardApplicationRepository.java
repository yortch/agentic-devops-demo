package com.threeriversbank.repository;

import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessCreditCardApplicationRepository extends JpaRepository<BusinessCreditCardApplication, Long> {
    Optional<BusinessCreditCardApplication> findByApplicationId(String applicationId);
}
