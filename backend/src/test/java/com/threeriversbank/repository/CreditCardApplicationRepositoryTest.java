package com.threeriversbank.repository;

import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.model.entity.CreditCardApplication;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class CreditCardApplicationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CreditCardApplicationRepository applicationRepository;

    private CreditCard testCard;

    @BeforeEach
    void setUp() {
        // The seed data creates cards with IDs 1-5, use the existing one
        testCard = entityManager.find(CreditCard.class, 1L);
    }

    @Test
    void saveApplication_ShouldPersistAndGenerateId() {
        CreditCardApplication application = createTestApplication();
        CreditCardApplication saved = applicationRepository.save(application);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getFirstName()).isEqualTo("Jane");
        assertThat(saved.getStatus()).isEqualTo("PENDING");
        assertThat(saved.getReferenceNumber()).startsWith("TRB-");
        assertThat(saved.getSubmittedAt()).isNotNull();
    }

    @Test
    void findByEmail_ShouldReturnMatchingApplications() {
        CreditCardApplication app = createTestApplication();
        applicationRepository.save(app);

        List<CreditCardApplication> results = applicationRepository.findByEmail("jane.doe@example.com");
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getEmail()).isEqualTo("jane.doe@example.com");
    }

    @Test
    void findByReferenceNumber_ShouldReturnApplication() {
        CreditCardApplication app = createTestApplication();
        app.setReferenceNumber("TRB-TEST123");
        CreditCardApplication saved = applicationRepository.save(app);

        Optional<CreditCardApplication> result = applicationRepository.findByReferenceNumber("TRB-TEST123");
        assertThat(result).isPresent();
        assertThat(result.get().getId()).isEqualTo(saved.getId());
    }

    @Test
    void findByCreditCardId_ShouldReturnApplicationsForCard() {
        CreditCardApplication app = createTestApplication();
        applicationRepository.save(app);

        List<CreditCardApplication> results = applicationRepository.findByCreditCardId(1L);
        assertThat(results).isNotEmpty();
    }

    @Test
    void findByStatus_ShouldReturnApplicationsWithStatus() {
        CreditCardApplication app = createTestApplication();
        applicationRepository.save(app);

        List<CreditCardApplication> results = applicationRepository.findByStatus("PENDING");
        assertThat(results).isNotEmpty();
        assertThat(results).allMatch(a -> "PENDING".equals(a.getStatus()));
    }

    private CreditCardApplication createTestApplication() {
        CreditCardApplication app = new CreditCardApplication();
        app.setCreditCard(testCard);
        app.setFirstName("Jane");
        app.setLastName("Doe");
        app.setEmail("jane.doe@example.com");
        app.setPhone("412-555-9876");
        app.setAddress("456 Oak Avenue");
        app.setCity("Pittsburgh");
        app.setState("PA");
        app.setZipCode("15213");
        app.setBusinessName("Doe Corp");
        app.setAnnualRevenue(new BigDecimal("250000"));
        app.setYearsInBusiness("1-2 years");
        app.setStatus("PENDING");
        app.setReferenceNumber("TRB-" + System.currentTimeMillis());
        app.setSubmittedAt(LocalDateTime.now());
        return app;
    }
}
