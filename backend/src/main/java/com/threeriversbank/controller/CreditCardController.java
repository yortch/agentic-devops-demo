package com.threeriversbank.controller;

import com.threeriversbank.model.dto.CreditCardDto;
import com.threeriversbank.service.CreditCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Tag(name = "Credit Cards", description = "Credit Card Information API")
public class CreditCardController {
    
    private final CreditCardService creditCardService;
    
    @GetMapping
    @Operation(summary = "Get all credit cards", description = "Retrieve list of all available business credit cards")
    public ResponseEntity<List<CreditCardDto>> getAllCards() {
        return ResponseEntity.ok(creditCardService.getAllCards());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get credit card by ID", description = "Retrieve detailed information about a specific credit card")
    public ResponseEntity<CreditCardDto> getCardById(@PathVariable Long id) {
        return creditCardService.getCardById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
