package com.threeriversbank.service;

import com.threeriversbank.model.dto.CreditCardDto;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CreditCardService {
    
    private final CreditCardRepository creditCardRepository;
    
    public List<CreditCardDto> getAllCards() {
        return creditCardRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Optional<CreditCardDto> getCardById(Long id) {
        return creditCardRepository.findById(id)
                .map(this::convertToDto);
    }
    
    private CreditCardDto convertToDto(CreditCard card) {
        return new CreditCardDto(
                card.getId(),
                card.getName(),
                card.getCardType(),
                card.getAnnualFee(),
                card.getIntroApr(),
                card.getRegularApr(),
                card.getRewardsRate(),
                card.getSignupBonus(),
                card.getCreditScoreNeeded(),
                card.getForeignTransactionFee(),
                card.getDescription(),
                card.getFeatures(),
                card.getBenefits()
        );
    }
}
