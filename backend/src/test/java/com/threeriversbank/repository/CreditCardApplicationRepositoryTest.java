package com.threeriversbank.repository;

import com.threeriversbank.model.entity.ApplicationStatus;
import com.threeriversbank.model.entity.CreditCardApplication;
import com.threeriversbank.model.entity.CreditCardApplicationRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CreditCardApplicationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CreditCardApplicationRepository creditCardApplicationRepository;

    @Test
    void findByTrackingId_WhenFound_ShouldReturnApplication() {
        // Arrange
        CreditCardApplication application = validApplication(1L);
        application.setTrackingId("known-tracking-id-123");
        entityManager.persistAndFlush(application);

        // Act
        Optional<CreditCardApplication> result = creditCardApplicationRepository.findByTrackingId("known-tracking-id-123");

        // Assert
        assertThat(result).isPresent();
        assertThat(result.get().getTrackingId()).isEqualTo("known-tracking-id-123");
        assertThat(result.get().getFirstName()).isEqualTo("Jane");
    }

    @Test
    void findByTrackingId_WhenNotFound_ShouldReturnEmptyOptional() {
        // Act
        Optional<CreditCardApplication> result = creditCardApplicationRepository.findByTrackingId("missing-tracking-id");

        // Assert
        assertThat(result).isEmpty();
    }

    @Test
    void save_ShouldGenerateTrackingIdAndTimestamps() {
        // Arrange
        CreditCardApplication application = validApplication(1L);
        application.setTrackingId(null);
        application.setStatus(null);

        // Act
        CreditCardApplication saved = creditCardApplicationRepository.saveAndFlush(application);

        // Assert
        assertThat(saved.getTrackingId()).isNotBlank();
        assertThat(UUID.fromString(saved.getTrackingId())).isNotNull();
        assertThat(saved.getStatus()).isEqualTo(ApplicationStatus.SUBMITTED);
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isEqualTo(saved.getCreatedAt());
    }

    @Test
    void save_ShouldPersistRelationshipToCreditCard() {
        // Arrange
        CreditCardApplication application = validApplication(1L);

        // Act
        CreditCardApplication saved = creditCardApplicationRepository.saveAndFlush(application);
        entityManager.clear();
        CreditCardApplication found = creditCardApplicationRepository.findById(saved.getId()).orElseThrow();

        // Assert
        assertThat(found.getCreditCardId()).isEqualTo(1L);
        assertThat(found.getCreditCard()).isNotNull();
        assertThat(found.getCreditCard().getId()).isEqualTo(1L);
        assertThat(found.getCreditCard().getName()).isEqualTo("Business Cash Rewards");
    }

    private CreditCardApplication validApplication(Long creditCardId) {
        CreditCardApplication application = new CreditCardApplication();
        application.setCreditCardId(creditCardId);
        application.setStatus(ApplicationStatus.SUBMITTED);
        application.setFirstName("Jane");
        application.setLastName("Doe");
        application.setEmail("jane.doe@example.com");
        application.setPhone("4125551234");
        application.setDateOfBirth(LocalDate.of(1990, 1, 15));
        application.setHomeStreet("123 Main St");
        application.setHomeCity("Pittsburgh");
        application.setHomeState("PA");
        application.setHomeZipCode("15222");
        application.setBusinessLegalName("Doe Consulting LLC");
        application.setBusinessStreet("456 Market St");
        application.setBusinessCity("Pittsburgh");
        application.setBusinessState("PA");
        application.setBusinessZipCode("15219");
        application.setBusinessType("Consulting");
        application.setYearsInBusiness(4);
        application.setTaxIdLast4("1234");
        application.setAnnualPersonalIncome(new BigDecimal("95000.00"));
        application.setAnnualBusinessRevenue(new BigDecimal("250000.00"));
        application.setEmploymentStatus("Self-Employed");
        application.setEmployerName("Doe Consulting LLC");
        application.setJobTitle("Owner");
        application.setYearsEmployed(4);
        return application;
    }
}