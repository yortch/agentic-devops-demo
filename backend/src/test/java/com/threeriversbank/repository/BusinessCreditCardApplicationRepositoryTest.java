package com.threeriversbank.repository;

import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import com.threeriversbank.model.entity.CreditCard;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("Business Credit Card Application Repository Tests")
class BusinessCreditCardApplicationRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private BusinessCreditCardApplicationRepository applicationRepository;

    @Autowired
    private CreditCardRepository creditCardRepository;

    private CreditCard testCard;

    @BeforeEach
    void setUp() {
        // Create and persist test credit card
        testCard = new CreditCard();
        testCard.setName("Test Business Card");
        testCard.setCardType("Business");
        testCard.setAnnualFee(BigDecimal.ZERO);
        testCard.setRegularApr("18.99%");
        testCard.setRewardsRate(new BigDecimal("2.0"));
        testCard.setCreditScoreNeeded("Good");
        testCard.setForeignTransactionFee(BigDecimal.ZERO);
        entityManager.persist(testCard);
        entityManager.flush();
    }

    @Test
    @DisplayName("should save and retrieve application")
    void saveApplication_shouldPersistAndRetrieve() {
        // Arrange
        BusinessCreditCardApplication application = createTestApplication("TRB-20260204-123456");

        // Act
        BusinessCreditCardApplication saved = applicationRepository.save(application);
        entityManager.flush();
        entityManager.clear();

        Optional<BusinessCreditCardApplication> retrieved = applicationRepository.findById(saved.getId());

        // Assert
        assertTrue(retrieved.isPresent());
        BusinessCreditCardApplication app = retrieved.get();
        assertEquals("TRB-20260204-123456", app.getApplicationNumber());
        assertEquals("Test Business LLC", app.getBusinessLegalName());
        assertEquals("John", app.getOwnerFirstName());
        assertEquals("Pending", app.getStatus());
    }

    @Test
    @DisplayName("should find application by application number")
    void findByApplicationNumber_shouldReturnApplication() {
        // Arrange
        BusinessCreditCardApplication application = createTestApplication("TRB-20260204-789012");
        applicationRepository.save(application);
        entityManager.flush();

        // Act
        Optional<BusinessCreditCardApplication> found = 
                applicationRepository.findByApplicationNumber("TRB-20260204-789012");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("TRB-20260204-789012", found.get().getApplicationNumber());
    }

    @Test
    @DisplayName("should find applications by status")
    void findByStatus_shouldReturnMatchingApplications() {
        // Arrange
        BusinessCreditCardApplication app1 = createTestApplication("TRB-20260204-111111");
        app1.setStatus("Pending");
        
        BusinessCreditCardApplication app2 = createTestApplication("TRB-20260204-222222");
        app2.setStatus("Pending");
        
        BusinessCreditCardApplication app3 = createTestApplication("TRB-20260204-333333");
        app3.setStatus("Approved");

        applicationRepository.saveAll(List.of(app1, app2, app3));
        entityManager.flush();

        // Act
        List<BusinessCreditCardApplication> pending = applicationRepository.findByStatus("Pending");
        List<BusinessCreditCardApplication> approved = applicationRepository.findByStatus("Approved");

        // Assert
        assertEquals(2, pending.size());
        assertEquals(1, approved.size());
        assertTrue(pending.stream().allMatch(app -> app.getStatus().equals("Pending")));
    }

    @Test
    @DisplayName("should find applications by owner email")
    void findByOwnerEmail_shouldReturnMatchingApplications() {
        // Arrange
        BusinessCreditCardApplication app1 = createTestApplication("TRB-20260204-444444");
        app1.setOwnerEmail("john@test.com");
        
        BusinessCreditCardApplication app2 = createTestApplication("TRB-20260204-555555");
        app2.setOwnerEmail("john@test.com");
        
        BusinessCreditCardApplication app3 = createTestApplication("TRB-20260204-666666");
        app3.setOwnerEmail("jane@test.com");

        applicationRepository.saveAll(List.of(app1, app2, app3));
        entityManager.flush();

        // Act
        List<BusinessCreditCardApplication> johnApps = applicationRepository.findByOwnerEmail("john@test.com");
        List<BusinessCreditCardApplication> janeApps = applicationRepository.findByOwnerEmail("jane@test.com");

        // Assert
        assertEquals(2, johnApps.size());
        assertEquals(1, janeApps.size());
        assertTrue(johnApps.stream().allMatch(app -> app.getOwnerEmail().equals("john@test.com")));
    }

    @Test
    @DisplayName("should find applications within date range")
    void findBySubmittedAtBetween_shouldReturnApplicationsInRange() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        LocalDateTime twoDaysAgo = now.minusDays(2);

        BusinessCreditCardApplication app1 = createTestApplication("TRB-20260204-777777");
        app1.setSubmittedAt(yesterday);
        
        BusinessCreditCardApplication app2 = createTestApplication("TRB-20260204-888888");
        app2.setSubmittedAt(now);
        
        BusinessCreditCardApplication app3 = createTestApplication("TRB-20260204-999999");
        app3.setSubmittedAt(twoDaysAgo);

        applicationRepository.saveAll(List.of(app1, app2, app3));
        entityManager.flush();

        // Act
        List<BusinessCreditCardApplication> recentApps = 
                applicationRepository.findBySubmittedAtBetween(yesterday.minusHours(1), now.plusHours(1));

        // Assert
        assertEquals(2, recentApps.size());
        assertTrue(recentApps.stream()
                .allMatch(app -> app.getSubmittedAt().isAfter(yesterday.minusHours(1)) 
                        && app.getSubmittedAt().isBefore(now.plusHours(1))));
    }

    @Test
    @DisplayName("should count applications by IP after specific time")
    void countBySubmissionIpAndSubmittedAtAfter_shouldReturnCorrectCount() {
        // Arrange
        LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
        LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);

        BusinessCreditCardApplication app1 = createTestApplication("TRB-20260204-101010");
        app1.setSubmissionIp("192.168.1.1");
        app1.setSubmittedAt(LocalDateTime.now());
        
        BusinessCreditCardApplication app2 = createTestApplication("TRB-20260204-202020");
        app2.setSubmissionIp("192.168.1.1");
        app2.setSubmittedAt(LocalDateTime.now().minusHours(12));
        
        BusinessCreditCardApplication app3 = createTestApplication("TRB-20260204-303030");
        app3.setSubmissionIp("192.168.1.1");
        app3.setSubmittedAt(twoDaysAgo);
        
        BusinessCreditCardApplication app4 = createTestApplication("TRB-20260204-404040");
        app4.setSubmissionIp("10.0.0.1");
        app4.setSubmittedAt(LocalDateTime.now());

        applicationRepository.saveAll(List.of(app1, app2, app3, app4));
        entityManager.flush();

        // Act
        Long countFromSameIP = applicationRepository.countBySubmissionIpAndSubmittedAtAfter("192.168.1.1", oneDayAgo);
        Long countFromDifferentIP = applicationRepository.countBySubmissionIpAndSubmittedAtAfter("10.0.0.1", oneDayAgo);

        // Assert
        assertEquals(2L, countFromSameIP); // app1 and app2 are within last 24 hours
        assertEquals(1L, countFromDifferentIP); // only app4
    }

    @Test
    @DisplayName("should maintain relationship with credit card")
    void application_shouldMaintainCreditCardRelationship() {
        // Arrange
        BusinessCreditCardApplication application = createTestApplication("TRB-20260204-505050");

        // Act
        BusinessCreditCardApplication saved = applicationRepository.save(application);
        entityManager.flush();
        entityManager.clear();

        Optional<BusinessCreditCardApplication> retrieved = applicationRepository.findById(saved.getId());

        // Assert
        assertTrue(retrieved.isPresent());
        assertNotNull(retrieved.get().getCreditCard());
        assertEquals(testCard.getId(), retrieved.get().getCreditCard().getId());
        assertEquals("Test Business Card", retrieved.get().getCreditCard().getName());
    }

    @Test
    @DisplayName("should handle null optional fields")
    void saveApplication_withNullOptionalFields_shouldSucceed() {
        // Arrange
        BusinessCreditCardApplication application = createTestApplication("TRB-20260204-606060");
        application.setDbaName(null);
        application.setBusinessWebsite(null);
        application.setNumberOfEmployeeCards(null);
        application.setAuthorizedUsersJson(null);

        // Act
        BusinessCreditCardApplication saved = applicationRepository.save(application);
        entityManager.flush();
        entityManager.clear();

        Optional<BusinessCreditCardApplication> retrieved = applicationRepository.findById(saved.getId());

        // Assert
        assertTrue(retrieved.isPresent());
        assertNull(retrieved.get().getDbaName());
        assertNull(retrieved.get().getBusinessWebsite());
        assertNull(retrieved.get().getNumberOfEmployeeCards());
    }

    private BusinessCreditCardApplication createTestApplication(String applicationNumber) {
        BusinessCreditCardApplication application = new BusinessCreditCardApplication();
        application.setApplicationNumber(applicationNumber);
        application.setCreditCard(testCard);
        application.setStatus("Pending");
        application.setSubmittedAt(LocalDateTime.now());
        application.setSubmissionIp("192.168.1.1");

        // Business Information
        application.setBusinessLegalName("Test Business LLC");
        application.setBusinessStructure("LLC");
        application.setTaxId("123456789"); // Plain text for tests
        application.setIndustry("Technology");
        application.setYearsInBusiness(5);
        application.setNumberOfEmployees(10);
        application.setAnnualBusinessRevenue("$500,000 - $1,000,000");
        application.setBusinessStreetAddress("123 Main St");
        application.setBusinessCity("Pittsburgh");
        application.setBusinessState("PA");
        application.setBusinessZip("15201");
        application.setBusinessPhone("4125551234");

        // Owner Information
        application.setOwnerFirstName("John");
        application.setOwnerLastName("Doe");
        application.setOwnerDateOfBirth(LocalDate.of(1985, 1, 1));
        application.setOwnerSsn("987654321"); // Plain text for tests
        application.setOwnerEmail("john.doe@test.com");
        application.setOwnerStreetAddress("456 Oak Ave");
        application.setOwnerCity("Pittsburgh");
        application.setOwnerState("PA");
        application.setOwnerZip("15202");
        application.setOwnerMobilePhone("4125555678");
        application.setOwnershipPercentage(100);
        application.setOwnerTitle("CEO");
        application.setOwnerAnnualIncome(new BigDecimal("150000"));

        // Card Preferences
        application.setRequestedCreditLimit("$25k");
        application.setNumberOfEmployeeCards(5);

        // Terms
        application.setAgreedToTerms(true);
        application.setConsentToCreditCheck(true);
        application.setElectronicSignature("John Doe");

        return application;
    }
}
