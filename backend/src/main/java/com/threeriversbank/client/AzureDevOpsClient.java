package com.threeriversbank.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@FeignClient(
    name = "azure-devops-api",
    url = "${azure.devops.base-url}",
    configuration = AzureDevOpsClientConfig.class
)
public interface AzureDevOpsClient {
    
    @GetMapping("/{organization}/{project}/_apis/wit/wiql?api-version=7.0")
    Map<String, Object> queryWorkItems(
        @PathVariable("organization") String organization,
        @PathVariable("project") String project,
        @RequestParam("query") String query
    );
    
    @GetMapping("/{organization}/{project}/_apis/wit/workitems/{id}?api-version=7.0")
    Map<String, Object> getWorkItem(
        @PathVariable("organization") String organization,
        @PathVariable("project") String project,
        @PathVariable("id") Long id
    );
    
    @GetMapping("/{organization}/{project}/_apis/wit/workitems?ids={ids}&api-version=7.0")
    Map<String, Object> getWorkItemsBatch(
        @PathVariable("organization") String organization,
        @PathVariable("project") String project,
        @PathVariable("ids") String ids
    );
}
