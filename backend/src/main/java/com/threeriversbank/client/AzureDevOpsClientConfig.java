package com.threeriversbank.client;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Base64;

@Configuration
public class AzureDevOpsClientConfig {
    
    @Value("${azure.devops.pat:}")
    private String personalAccessToken;
    
    @Bean
    public RequestInterceptor azureDevOpsRequestInterceptor() {
        return requestTemplate -> {
            if (personalAccessToken != null && !personalAccessToken.isEmpty()) {
                String auth = ":" + personalAccessToken;
                String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
                requestTemplate.header("Authorization", "Basic " + encodedAuth);
            }
            requestTemplate.header("Content-Type", "application/json");
        };
    }
}
