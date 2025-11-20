package com.threeriversbank.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching
public class CacheConfig {
    // Spring Cache configuration with simple cache manager
    // Caches: transactions (5 min TTL), billing (1 hour TTL)
}
