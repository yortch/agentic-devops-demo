package com.threeriversbank.controller;

import com.threeriversbank.model.dto.*;
import com.threeriversbank.service.CardApplicationService;
import com.threeriversbank.service.CreditCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Credit Cards", description = "Three Rivers Bank Business Credit Card API")
public class CreditCardController {
    
    private final CreditCardService creditCardService;
    private final CardApplicationService cardApplicationService;
    
    @GetMapping
    @Operation(summary = "Get all credit cards", description = "Returns list of all available business credit cards")
    public ResponseEntity<List<CreditCardDto>> getAllCards(
            @RequestParam(required = false) String cardType,
            @RequestParam(required = false) Boolean noAnnualFee) {
        log.info("GET /api/cards - cardType: {}, noAnnualFee: {}", cardType, noAnnualFee);
        
        List<CreditCardDto> cards;
        if (cardType != null) {
            cards = creditCardService.getCardsByType(cardType);
        } else if (Boolean.TRUE.equals(noAnnualFee)) {
            cards = creditCardService.getCardsWithNoAnnualFee();
        } else {
            cards = creditCardService.getAllCreditCards();
        }
        
        return ResponseEntity.ok(cards);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get credit card by ID", description = "Returns detailed information for a specific credit card")
    public ResponseEntity<CreditCardDto> getCardById(@PathVariable Long id) {
        log.info("GET /api/cards/{}", id);
        CreditCardDto card = creditCardService.getCreditCardById(id);
        return ResponseEntity.ok(card);
    }
    
    @GetMapping("/{id}/fees")
    @Operation(summary = "Get card fee schedule", description = "Returns fee schedule for a specific credit card")
    public ResponseEntity<List<FeeScheduleDto>> getCardFees(@PathVariable Long id) {
        log.info("GET /api/cards/{}/fees", id);
        List<FeeScheduleDto> fees = creditCardService.getCardFees(id);
        return ResponseEntity.ok(fees);
    }
    
    @GetMapping("/{id}/interest")
    @Operation(summary = "Get card interest rates", description = "Returns interest rate details for a specific credit card")
    public ResponseEntity<List<InterestRateDto>> getCardInterestRates(@PathVariable Long id) {
        log.info("GET /api/cards/{}/interest", id);
        List<InterestRateDto> rates = creditCardService.getCardInterestRates(id);
        return ResponseEntity.ok(rates);
    }
    
    @GetMapping("/{id}/transactions")
    @Operation(summary = "Get card transactions", description = "Returns sample transactions for a credit card (from BIAN API)")
    public ResponseEntity<List<CardTransactionDto>> getCardTransactions(@PathVariable Long id) {
        log.info("GET /api/cards/{}/transactions", id);
        List<CardTransactionDto> transactions = creditCardService.getCardTransactions(id);
        return ResponseEntity.ok(transactions);
    }
    
    @GetMapping("/{id}/billing")
    @Operation(summary = "Get card billing", description = "Returns billing information for a credit card (from BIAN API)")
    public ResponseEntity<BillingDto> getCardBilling(@PathVariable Long id) {
        log.info("GET /api/cards/{}/billing", id);
        BillingDto billing = creditCardService.getCardBilling(id);
        return ResponseEntity.ok(billing);
    }
    
    @PostMapping("/{id}/apply")
    @Operation(summary = "Submit credit card application", description = "Submit a new business credit card application")
    public ResponseEntity<CardApplicationDto> submitApplication(
            @PathVariable Long id,
            @Valid @RequestBody CardApplicationRequest request) {
        log.info("POST /api/cards/{}/apply - applicant: {}", id, request.getApplicantName());
        CardApplicationDto application = cardApplicationService.submitApplication(id, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(application);
    }
    
    @GetMapping("/applications/{id}")
    @Operation(summary = "Get application status", description = "Get the status of a credit card application")
    public ResponseEntity<CardApplicationDto> getApplicationStatus(@PathVariable Long id) {
        log.info("GET /api/cards/applications/{}", id);
        CardApplicationDto application = cardApplicationService.getApplicationById(id);
        return ResponseEntity.ok(application);
    }
}
