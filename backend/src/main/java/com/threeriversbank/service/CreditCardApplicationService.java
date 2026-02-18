package com.threeriversbank.service;

import com.threeriversbank.model.dto.CreditCardApplicationCreateRequestDto;
import com.threeriversbank.model.dto.CreditCardApplicationCreateResponseDto;
import com.threeriversbank.model.dto.CreditCardApplicationStatusDto;
import com.threeriversbank.model.entity.CreditCard;
import com.threeriversbank.model.entity.CreditCardApplication;
import com.threeriversbank.model.entity.CreditCardApplicationRepository;
import com.threeriversbank.repository.CreditCardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditCardApplicationService {

    private final CreditCardApplicationRepository creditCardApplicationRepository;
    private final CreditCardRepository creditCardRepository;

    @Transactional
    public CreditCardApplicationCreateResponseDto submitApplication(CreditCardApplicationCreateRequestDto requestDto) {
        log.info("Submitting credit card application for cardId: {}", requestDto.getCreditCardId());

        if (!creditCardRepository.existsById(requestDto.getCreditCardId())) {
            throw new NoSuchElementException("Credit card not found with id: " + requestDto.getCreditCardId());
        }

        CreditCardApplication application = mapToEntity(requestDto);
        CreditCardApplication savedApplication = creditCardApplicationRepository.save(application);

        return CreditCardApplicationCreateResponseDto.builder()
                .trackingId(savedApplication.getTrackingId())
                .status(savedApplication.getStatus())
                .submittedAt(savedApplication.getCreatedAt())
                .creditCardId(savedApplication.getCreditCardId())
                .build();
    }

    @Transactional(readOnly = true)
    public CreditCardApplicationStatusDto getApplicationStatus(String trackingId) {
        log.info("Fetching application status for trackingId: {}", trackingId);

        CreditCardApplication application = creditCardApplicationRepository.findByTrackingId(trackingId)
                .orElseThrow(() -> new NoSuchElementException("Application not found with trackingId: " + trackingId));

        CreditCard creditCard = creditCardRepository.findById(application.getCreditCardId())
                .orElseThrow(() -> new NoSuchElementException("Credit card not found with id: " + application.getCreditCardId()));

        return CreditCardApplicationStatusDto.builder()
                .trackingId(application.getTrackingId())
                .status(application.getStatus())
                .submittedAt(application.getCreatedAt())
                .creditCardSummary(CreditCardApplicationStatusDto.CreditCardSummaryDto.builder()
                        .cardId(creditCard.getId())
                        .cardName(creditCard.getName())
                        .build())
                .build();
    }

    private CreditCardApplication mapToEntity(CreditCardApplicationCreateRequestDto requestDto) {
        CreditCardApplication entity = new CreditCardApplication();
        entity.setCreditCardId(requestDto.getCreditCardId());
        entity.setFirstName(requestDto.getFirstName());
        entity.setLastName(requestDto.getLastName());
        entity.setEmail(requestDto.getEmail());
        entity.setPhone(requestDto.getPhone());
        entity.setDateOfBirth(requestDto.getDateOfBirth());

        entity.setHomeStreet(requestDto.getHomeAddress().getStreet());
        entity.setHomeCity(requestDto.getHomeAddress().getCity());
        entity.setHomeState(requestDto.getHomeAddress().getState());
        entity.setHomeZipCode(requestDto.getHomeAddress().getZipCode());

        entity.setBusinessLegalName(requestDto.getBusinessLegalName());
        entity.setBusinessStreet(requestDto.getBusinessAddress().getStreet());
        entity.setBusinessCity(requestDto.getBusinessAddress().getCity());
        entity.setBusinessState(requestDto.getBusinessAddress().getState());
        entity.setBusinessZipCode(requestDto.getBusinessAddress().getZipCode());
        entity.setBusinessType(requestDto.getBusinessType());
        entity.setYearsInBusiness(requestDto.getYearsInBusiness());
        entity.setTaxIdLast4(requestDto.getTaxIdLast4());
        entity.setAnnualPersonalIncome(requestDto.getAnnualPersonalIncome());
        entity.setAnnualBusinessRevenue(requestDto.getAnnualBusinessRevenue());
        entity.setEmploymentStatus(requestDto.getEmploymentStatus());
        entity.setEmployerName(requestDto.getEmployerName());
        entity.setJobTitle(requestDto.getJobTitle());
        entity.setYearsEmployed(requestDto.getYearsEmployed());

        return entity;
    }
}