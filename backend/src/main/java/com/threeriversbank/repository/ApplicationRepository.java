package com.threeriversbank.repository;

import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<BusinessCreditCardApplication, Long> {

    Optional<BusinessCreditCardApplication> findByApplicationId(String applicationId);

    @Query("SELECT COUNT(a) FROM BusinessCreditCardApplication a WHERE a.ipAddress = :ipAddress AND a.submittedAt >= :since")
    long countByIpAddressSince(String ipAddress, LocalDateTime since);

    List<BusinessCreditCardApplication> findByCreditCardId(Long creditCardId);
}
