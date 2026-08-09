package com.threeriversbank.service;

import com.threeriversbank.model.dto.ApplicationRequestDto;
import com.threeriversbank.model.dto.ApplicationResponseDto;
import com.threeriversbank.model.entity.BusinessCreditCardApplication;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.BusinessCreditCardApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Application Service Tests")
class ApplicationServiceTest {

    @Mock
    private BusinessCreditCardApplicationRepository applicationRepository;

    @Mock
    private CreditCardRepository creditCardRepository;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private ApplicationService applicationService;

    private CreditCard testCard;
    private ApplicationRequestDto validApplication;

    @BeforeEach
    void setUp() {
        // Setup test credit card
        testCard = new CreditCard();
        testCard.setId(1L);
        testCard.setName("Business Cash Rewards");
        testCard.setCardType("Cash Back");

        // Setup valid application request
        validApplication = ApplicationRequestDto.builder()
                .creditCardId(1L)
                // Business Information
                .businessLegalName("Test Business LLC")
                .businessStructure("LLC")
                .taxId("123456789")
                .industry("Technology")
                .yearsInBusiness(5)
                .numberOfEmployees(10)
                .annualBusinessRevenue("$500,000 - $1,000,000")
                .businessStreetAddress("123 Main St")
                .businessCity("Pittsburgh")
                .businessState("PA")
                .businessZip("15201")
                .businessPhone("4125551234")
                // Owner Information
                .ownerFirstName("John")
                .ownerLastName("Doe")
                .ownerDateOfBirth(LocalDate.of(1985, 1, 1))
                .ownerSsn("987654321")
                .ownerEmail("john.doe@testbusiness.com")
                .ownerStreetAddress("456 Oak Ave")
                .ownerCity("Pittsburgh")
                .ownerState("PA")
                .ownerZip("15202")
                .ownerMobilePhone("4125555678")
                .ownershipPercentage(100)
                .ownerTitle("CEO")
                .ownerAnnualIncome(new BigDecimal("150000"))
                // Card Preferences
                .requestedCreditLimit("$25k")
                .numberOfEmployeeCards(5)
                // Terms
                .agreedToTerms(true)
                .consentToCreditCheck(true)
                .electronicSignature("John Doe")
                .build();
    }

    @Test
    @DisplayName("submitApplication should successfully create application with valid data")
    void submitApplication_withValidData_shouldCreateApplication() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(applicationRepository.countBySubmissionIpAndSubmittedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(0L);

        BusinessCreditCardApplication savedApplication = new BusinessCreditCardApplication();
        savedApplication.setId(1L);
        savedApplication.setApplicationNumber("TRB-20260204-123456");
        savedApplication.setCreditCard(testCard);
        savedApplication.setStatus("Pending");
        savedApplication.setSubmittedAt(LocalDateTime.now());

        when(applicationRepository.save(any(BusinessCreditCardApplication.class)))
                .thenReturn(savedApplication);

        // Act
        ApplicationResponseDto response = applicationService.submitApplication(validApplication);

        // Assert
        assertNotNull(response);
        assertEquals("TRB-20260204-123456", response.getApplicationNumber());
        assertEquals("Pending", response.getStatus());
        assertEquals("Business Cash Rewards", response.getCreditCardName());
        assertEquals("Decision in 5-7 business days", response.getExpectedDecisionTimeframe());
        assertTrue(response.getConfirmationMessage().contains("john.doe@testbusiness.com"));

        // Verify repository interactions
        verify(creditCardRepository, times(1)).findById(1L);
        verify(applicationRepository, times(1)).save(any(BusinessCreditCardApplication.class));

        // Verify saved data
        ArgumentCaptor<BusinessCreditCardApplication> captor = 
                ArgumentCaptor.forClass(BusinessCreditCardApplication.class);
        verify(applicationRepository).save(captor.capture());
        BusinessCreditCardApplication captured = captor.getValue();
        
        assertEquals("Test Business LLC", captured.getBusinessLegalName());
        assertEquals("LLC", captured.getBusinessStructure());
        assertEquals("John", captured.getOwnerFirstName());
        assertEquals("Doe", captured.getOwnerLastName());
        assertEquals("$25k", captured.getRequestedCreditLimit());
        assertEquals(5, captured.getNumberOfEmployeeCards());
        assertTrue(captured.getAgreedToTerms());
        assertTrue(captured.getConsentToCreditCheck());
        assertEquals("John Doe", captured.getElectronicSignature());
    }

    @Test
    @DisplayName("submitApplication should throw exception when credit card not found")
    void submitApplication_whenCardNotFound_shouldThrowException() {
        // Arrange
        when(creditCardRepository.findById(999L)).thenReturn(Optional.empty());
        validApplication.setCreditCardId(999L);

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> applicationService.submitApplication(validApplication)
        );

        assertEquals("Credit card not found with ID: 999", exception.getMessage());
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitApplication should reject applicant under 18 years old")
    void submitApplication_whenApplicantUnder18_shouldThrowException() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        validApplication.setOwnerDateOfBirth(LocalDate.now().minusYears(17)); // 17 years old

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> applicationService.submitApplication(validApplication)
        );

        assertEquals("Applicant must be at least 18 years old", exception.getMessage());
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitApplication should enforce rate limiting (max 3 per day)")
    void submitApplication_whenRateLimitExceeded_shouldThrowException() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(applicationRepository.countBySubmissionIpAndSubmittedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(3L); // Already 3 applications

        // Act & Assert
        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> applicationService.submitApplication(validApplication)
        );

        assertEquals("Maximum application limit reached. Please try again later.", exception.getMessage());
        verify(applicationRepository, never()).save(any());
    }

    @Test
    @DisplayName("submitApplication should accept applicant exactly 18 years old")
    void submitApplication_whenApplicantExactly18_shouldSucceed() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(applicationRepository.countBySubmissionIpAndSubmittedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(0L);

        BusinessCreditCardApplication savedApplication = new BusinessCreditCardApplication();
        savedApplication.setId(1L);
        savedApplication.setApplicationNumber("TRB-20260204-123456");
        savedApplication.setCreditCard(testCard);
        savedApplication.setStatus("Pending");
        savedApplication.setSubmittedAt(LocalDateTime.now());

        when(applicationRepository.save(any(BusinessCreditCardApplication.class)))
                .thenReturn(savedApplication);

        validApplication.setOwnerDateOfBirth(LocalDate.now().minusYears(18)); // Exactly 18

        // Act
        ApplicationResponseDto response = applicationService.submitApplication(validApplication);

        // Assert
        assertNotNull(response);
        verify(applicationRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("submitApplication should handle X-Forwarded-For header for IP")
    void submitApplication_withXForwardedFor_shouldUseFirstIP() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1, 10.0.0.2, 10.0.0.3");
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");

        BusinessCreditCardApplication savedApplication = new BusinessCreditCardApplication();
        savedApplication.setId(1L);
        savedApplication.setApplicationNumber("TRB-20260204-123456");
        savedApplication.setCreditCard(testCard);
        savedApplication.setStatus("Pending");
        savedApplication.setSubmittedAt(LocalDateTime.now());

        when(applicationRepository.save(any(BusinessCreditCardApplication.class)))
                .thenReturn(savedApplication);

        // Act
        applicationService.submitApplication(validApplication);

        // Assert
        verify(applicationRepository).countBySubmissionIpAndSubmittedAtAfter(eq("10.0.0.1"), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("submitApplication should encrypt sensitive data")
    void submitApplication_shouldEncryptSensitiveData() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(applicationRepository.countBySubmissionIpAndSubmittedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(0L);

        BusinessCreditCardApplication savedApplication = new BusinessCreditCardApplication();
        savedApplication.setId(1L);
        savedApplication.setApplicationNumber("TRB-20260204-123456");
        savedApplication.setCreditCard(testCard);
        savedApplication.setStatus("Pending");
        savedApplication.setSubmittedAt(LocalDateTime.now());

        when(applicationRepository.save(any(BusinessCreditCardApplication.class)))
                .thenReturn(savedApplication);

        // Act
        applicationService.submitApplication(validApplication);

        // Assert - verify sensitive data was encrypted
        ArgumentCaptor<BusinessCreditCardApplication> captor = 
                ArgumentCaptor.forClass(BusinessCreditCardApplication.class);
        verify(applicationRepository).save(captor.capture());
        BusinessCreditCardApplication captured = captor.getValue();

        // Check that SSN and Tax ID are encrypted (placeholder shows last 4)
        assertTrue(captured.getTaxId().startsWith("ENCRYPTED:"));
        assertTrue(captured.getTaxId().contains("6789")); // Last 4 of 123456789
        assertTrue(captured.getOwnerSsn().startsWith("ENCRYPTED:"));
        assertTrue(captured.getOwnerSsn().contains("4321")); // Last 4 of 987654321
    }

    @Test
    @DisplayName("submitApplication should generate unique application numbers")
    void submitApplication_shouldGenerateUniqueApplicationNumbers() {
        // Arrange
        when(creditCardRepository.findById(1L)).thenReturn(Optional.of(testCard));
        when(request.getRemoteAddr()).thenReturn("192.168.1.1");
        when(applicationRepository.countBySubmissionIpAndSubmittedAtAfter(anyString(), any(LocalDateTime.class)))
                .thenReturn(0L);

        BusinessCreditCardApplication savedApp1 = new BusinessCreditCardApplication();
        savedApp1.setId(1L);
        savedApp1.setApplicationNumber("TRB-20260204-123456");
        savedApp1.setCreditCard(testCard);
        savedApp1.setStatus("Pending");
        savedApp1.setSubmittedAt(LocalDateTime.now());

        when(applicationRepository.save(any(BusinessCreditCardApplication.class)))
                .thenReturn(savedApp1);

        // Act - capture the generated application number
        ArgumentCaptor<BusinessCreditCardApplication> captor = 
                ArgumentCaptor.forClass(BusinessCreditCardApplication.class);

        applicationService.submitApplication(validApplication);

        verify(applicationRepository).save(captor.capture());
        String appNumber = captor.getValue().getApplicationNumber();

        // Assert
        assertNotNull(appNumber);
        assertTrue(appNumber.matches("TRB-\\d{8}-\\d{6}"));
        assertTrue(appNumber.startsWith("TRB-20260204-")); // Today's date
    }
}
