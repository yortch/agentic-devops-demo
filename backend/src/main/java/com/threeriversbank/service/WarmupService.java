package com.threeriversbank.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarmupService {

    private final CreditCardService creditCardService;

    /**
     * Periodically calls getAllCreditCards() to keep the JVM hot, Hibernate query plan
     * cache warm, and the H2 HikariCP connection pool active after idle periods.
     * Runs every 5 minutes (300,000 ms) with a 1-minute (60,000 ms) initial delay.
     * Delays are configurable via warmup.fixed-delay and warmup.initial-delay properties.
     */
    @Scheduled(fixedDelayString = "${warmup.fixed-delay}", initialDelayString = "${warmup.initial-delay}")
    public void warmup() {
        log.debug("WarmupService: running scheduled warmup to keep JVM and Hibernate hot");
        try {
            int count = creditCardService.getAllCreditCards().size();
            log.debug("WarmupService: warmup complete, {} cards loaded", count);
        } catch (Exception e) {
            log.warn("WarmupService: warmup query failed: {}", e.getMessage());
        }
    }
}
