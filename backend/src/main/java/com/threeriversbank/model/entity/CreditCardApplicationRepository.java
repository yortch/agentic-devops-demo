package com.threeriversbank.model.entity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreditCardApplicationRepository extends JpaRepository<CreditCardApplication, Long> {
    Optional<CreditCardApplication> findByTrackingId(String trackingId);
}
