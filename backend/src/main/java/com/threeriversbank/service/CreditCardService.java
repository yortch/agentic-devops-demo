package com.threeriversbank.service;

import com.threeriversbank.client.BianApiClient;
import com.threeriversbank.model.dto.BillingDto;
import com.threeriversbank.model.dto.CardFeatureDto;
import com.threeriversbank.model.dto.CardTransactionDto;
import com.threeriversbank.model.dto.CreditCardDto;
import com.threeriversbank.model.dto.FeeScheduleDto;
import com.threeriversbank.model.dto.InterestRateDto;
import com.threeriversbank.model.entity.CardFeature;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.model.entity.FeeSchedule;
import com.threeriversbank.model.entity.InterestRate;
import com.threeriversbank.repository.CardFeatureRepository;
import com.threeriversbank.repository.CreditCardRepository;
import com.threeriversbank.repository.FeeScheduleRepository;
import com.threeriversbank.repository.InterestRateRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardService {
    
    private final CreditCardRepository creditCardRepository;
    private final CardFeatureRepository cardFeatureRepository;
    private final FeeScheduleRepository feeScheduleRepository;
    private final InterestRateRepository interestRateRepository;
    private final BianApiClient bianApiClient;
    
    @Transactional(readOnly = true)
    public List<CreditCardDto> getAllCreditCards() {
        log.info("Fetching all credit cards from H2 database");
        return creditCardRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public CreditCardDto getCreditCardById(Long id) {
        log.info("Fetching credit card with id: {} from H2 database", id);
        CreditCard card = creditCardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Credit card not found with id: " + id));
        return convertToDtoWithDetails(card);
    }
    
    @Transactional(readOnly = true)
    public List<FeeScheduleDto> getCardFees(Long cardId) {
        log.info("Fetching fee schedule for card id: {}", cardId);
        return feeScheduleRepository.findByCreditCardId(cardId).stream()
                .map(this::convertToFeeDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<InterestRateDto> getCardInterestRates(Long cardId) {
        log.info("Fetching interest rates for card id: {}", cardId);
        return interestRateRepository.findByCreditCardId(cardId).stream()
                .map(this::convertToInterestDto)
                .collect(Collectors.toList());
    }
    
    @Cacheable(value = "transactions", key = "#cardId")
    @CircuitBreaker(name = "bianApi", fallbackMethod = "getTransactionsFallback")
    @Retry(name = "bianApi")
    public List<CardTransactionDto> getCardTransactions(Long cardId) {
        log.info("Fetching transactions for card id: {} from BIAN API", cardId);
        try {
            // Call BIAN API for sample transactions
            // For demo purposes, returning mock data as BIAN API might not have real data
            return getSampleTransactions(cardId);
        } catch (Exception e) {
            log.error("Error fetching transactions from BIAN API: {}", e.getMessage());
            throw e;
        }
    }
    
    public List<CardTransactionDto> getTransactionsFallback(Long cardId, Exception ex) {
        log.warn("Using fallback for transactions for card id: {} due to: {}", cardId, ex.getMessage());
        return getSampleTransactions(cardId);
    }
    
    @Cacheable(value = "billing", key = "#cardId")
    @CircuitBreaker(name = "bianApi", fallbackMethod = "getBillingFallback")
    @Retry(name = "bianApi")
    public BillingDto getCardBilling(Long cardId) {
        log.info("Fetching billing for card id: {} from BIAN API", cardId);
        try {
            // Call BIAN API for billing data
            // For demo purposes, returning mock data
            return getSampleBilling(cardId);
        } catch (Exception e) {
            log.error("Error fetching billing from BIAN API: {}", e.getMessage());
            throw e;
        }
    }
    
    public BillingDto getBillingFallback(Long cardId, Exception ex) {
        log.warn("Using fallback for billing for card id: {} due to: {}", cardId, ex.getMessage());
        return getSampleBilling(cardId);
    }
    
    @Transactional(readOnly = true)
    public List<CreditCardDto> getCardsByType(String cardType) {
        log.info("Fetching cards by type: {}", cardType);
        return creditCardRepository.findByCardType(cardType).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<CreditCardDto> getCardsWithNoAnnualFee() {
        log.info("Fetching cards with no annual fee");
        return creditCardRepository.findCardsWithNoAnnualFee().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    // Conversion methods
    private CreditCardDto convertToDto(CreditCard card) {
        return CreditCardDto.builder()
                .id(card.getId())
                .name(card.getName())
                .cardType(card.getCardType())
                .annualFee(card.getAnnualFee())
                .introApr(card.getIntroApr())
                .regularApr(card.getRegularApr())
                .rewardsRate(card.getRewardsRate())
                .signupBonus(card.getSignupBonus())
                .creditScoreNeeded(card.getCreditScoreNeeded())
                .foreignTransactionFee(card.getForeignTransactionFee())
                .description(card.getDescription())
                .features(card.getFeatures())
                .benefits(card.getBenefits())
                .build();
    }
    
    private CreditCardDto convertToDtoWithDetails(CreditCard card) {
        CreditCardDto dto = convertToDto(card);
        dto.setCardFeatures(card.getCardFeatures().stream()
                .map(this::convertToFeatureDto)
                .collect(Collectors.toList()));
        dto.setFeeSchedules(card.getFeeSchedules().stream()
                .map(this::convertToFeeDto)
                .collect(Collectors.toList()));
        dto.setInterestRates(card.getInterestRates().stream()
                .map(this::convertToInterestDto)
                .collect(Collectors.toList()));
        return dto;
    }
    
    private CardFeatureDto convertToFeatureDto(CardFeature feature) {
        return CardFeatureDto.builder()
                .id(feature.getId())
                .featureName(feature.getFeatureName())
                .featureValue(feature.getFeatureValue())
                .featureType(feature.getFeatureType())
                .build();
    }
    
    private FeeScheduleDto convertToFeeDto(FeeSchedule fee) {
        return FeeScheduleDto.builder()
                .id(fee.getId())
                .feeType(fee.getFeeType())
                .feeAmount(fee.getFeeAmount())
                .feeDescription(fee.getFeeDescription())
                .build();
    }
    
    private InterestRateDto convertToInterestDto(InterestRate rate) {
        return InterestRateDto.builder()
                .id(rate.getId())
                .rateType(rate.getRateType())
                .rateValue(rate.getRateValue())
                .effectiveDate(rate.getEffectiveDate())
                .calculationMethod(rate.getCalculationMethod())
                .build();
    }
    
    // Sample data generation methods
    private List<CardTransactionDto> getSampleTransactions(Long cardId) {
        List<CardTransactionDto> transactions = new ArrayList<>();
        transactions.add(CardTransactionDto.builder()
                .transactionId("TXN001")
                .merchantName("Office Supplies Co")
                .amount(new BigDecimal("245.50"))
                .currency("USD")
                .transactionDate(LocalDateTime.now().minusDays(2))
                .category("Office Supplies")
                .status("Completed")
                .build());
        transactions.add(CardTransactionDto.builder()
                .transactionId("TXN002")
                .merchantName("Business Travel Hotel")
                .amount(new BigDecimal("450.00"))
                .currency("USD")
                .transactionDate(LocalDateTime.now().minusDays(5))
                .category("Travel")
                .status("Completed")
                .build());
        transactions.add(CardTransactionDto.builder()
                .transactionId("TXN003")
                .merchantName("Tech Equipment Store")
                .amount(new BigDecimal("1250.00"))
                .currency("USD")
                .transactionDate(LocalDateTime.now().minusDays(7))
                .category("Equipment")
                .status("Completed")
                .build());
        return transactions;
    }
    
    private BillingDto getSampleBilling(Long cardId) {
        return BillingDto.builder()
                .billingId("BILL" + cardId + "001")
                .statementDate(LocalDate.now().minusDays(15))
                .dueDate(LocalDate.now().plusDays(10))
                .totalAmount(new BigDecimal("1945.50"))
                .minimumPayment(new BigDecimal("58.37"))
                .status("Current")
                .build();
    }
}
