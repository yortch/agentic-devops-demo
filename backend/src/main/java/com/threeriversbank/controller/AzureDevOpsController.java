package com.threeriversbank.controller;

import com.threeriversbank.model.dto.BacklogItemDto;
import com.threeriversbank.model.dto.WorkItemDto;
import com.threeriversbank.service.AzureDevOpsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Azure DevOps", description = "Azure DevOps Work Item Integration API")
public class AzureDevOpsController {
    
    private final AzureDevOpsService azureDevOpsService;
    
    @GetMapping("/workitems/user-stories")
    @Operation(summary = "Get all user stories", description = "Returns list of all user stories from Azure DevOps")
    public ResponseEntity<List<WorkItemDto>> getUserStories() {
        log.info("GET /api/workitems/user-stories");
        List<WorkItemDto> userStories = azureDevOpsService.getUserStories();
        return ResponseEntity.ok(userStories);
    }
    
    @GetMapping("/workitems")
    @Operation(summary = "Get all work items", description = "Returns list of all work items from Azure DevOps")
    public ResponseEntity<List<WorkItemDto>> getAllWorkItems() {
        log.info("GET /api/workitems");
        List<WorkItemDto> workItems = azureDevOpsService.getAllWorkItems();
        return ResponseEntity.ok(workItems);
    }
    
    @GetMapping("/workitems/{id}")
    @Operation(summary = "Get work item by ID", description = "Returns detailed information for a specific work item")
    public ResponseEntity<WorkItemDto> getWorkItemById(@PathVariable Long id) {
        log.info("GET /api/workitems/{}", id);
        WorkItemDto workItem = azureDevOpsService.getWorkItemById(id);
        return ResponseEntity.ok(workItem);
    }
    
    @GetMapping("/projects/{projectName}/backlog")
    @Operation(summary = "Get project backlog", description = "Returns backlog items for a specific project")
    public ResponseEntity<List<BacklogItemDto>> getProjectBacklog(@PathVariable String projectName) {
        log.info("GET /api/projects/{}/backlog", projectName);
        List<BacklogItemDto> backlog = azureDevOpsService.getProjectBacklog(projectName);
        return ResponseEntity.ok(backlog);
    }
}
