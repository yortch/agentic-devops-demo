package com.threeriversbank.service;

import com.threeriversbank.model.dto.CreditCardApplicationRequest;
import com.threeriversbank.model.dto.CreditCardApplicationResponse;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.model.entity.CreditCardApplication;
import com.threeriversbank.repository.CreditCardApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardApplicationService {

    private final CreditCardApplicationRepository applicationRepository;
    private final CreditCardRepository creditCardRepository;

    @Transactional
    public CreditCardApplicationResponse submitApplication(CreditCardApplicationRequest request) {
        log.info("Submitting credit card application for card id: {} by {}", 
                request.getCardId(), request.getEmail());

        CreditCard card = creditCardRepository.findById(request.getCardId())
                .orElseThrow(() -> new RuntimeException("Credit card not found with id: " + request.getCardId()));

        CreditCardApplication application = new CreditCardApplication();
        application.setCreditCard(card);
        application.setFirstName(request.getFirstName());
        application.setLastName(request.getLastName());
        application.setEmail(request.getEmail());
        application.setPhone(request.getPhone());
        application.setAddress(request.getAddress());
        application.setCity(request.getCity());
        application.setState(request.getState());
        application.setZipCode(request.getZipCode());
        application.setBusinessName(request.getBusinessName());
        application.setAnnualRevenue(request.getAnnualRevenue());
        application.setYearsInBusiness(request.getYearsInBusiness());

        CreditCardApplication saved = applicationRepository.save(application);
        log.info("Application submitted successfully with reference: {}", saved.getReferenceNumber());

        return convertToResponse(saved);
    }

    @Transactional(readOnly = true)
    public CreditCardApplicationResponse getApplicationByReference(String referenceNumber) {
        log.info("Fetching application by reference: {}", referenceNumber);
        CreditCardApplication application = applicationRepository.findByReferenceNumber(referenceNumber)
                .orElseThrow(() -> new RuntimeException("Application not found with reference: " + referenceNumber));
        return convertToResponse(application);
    }

    @Transactional(readOnly = true)
    public List<CreditCardApplicationResponse> getApplicationsByEmail(String email) {
        log.info("Fetching applications for email: {}", email);
        return applicationRepository.findByEmail(email).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private CreditCardApplicationResponse convertToResponse(CreditCardApplication application) {
        return CreditCardApplicationResponse.builder()
                .id(application.getId())
                .cardId(application.getCreditCard().getId())
                .cardName(application.getCreditCard().getName())
                .firstName(application.getFirstName())
                .lastName(application.getLastName())
                .email(application.getEmail())
                .phone(application.getPhone())
                .businessName(application.getBusinessName())
                .status(application.getStatus())
                .referenceNumber(application.getReferenceNumber())
                .submittedAt(application.getSubmittedAt())
                .build();
    }
}
