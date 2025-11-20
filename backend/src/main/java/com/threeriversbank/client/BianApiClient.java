package com.threeriversbank.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(
    name = "bian-api",
    url = "${bian.api.base-url}",
    configuration = BianApiClientConfig.class
)
public interface BianApiClient {
    
    @GetMapping("/CreditCard/{id}/Retrieve")
    Map<String, Object> retrieveCreditCard(@PathVariable("id") Long id);
    
    @GetMapping("/CreditCard/{id}/CardTransaction/{txid}/Retrieve")
    Map<String, Object> retrieveCardTransaction(
        @PathVariable("id") Long id,
        @PathVariable("txid") String txid
    );
    
    @GetMapping("/CreditCard/{id}/Billing/{billingid}/Retrieve")
    Map<String, Object> retrieveBilling(
        @PathVariable("id") Long id,
        @PathVariable("billingid") String billingid
    );
}
