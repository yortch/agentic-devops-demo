package com.threeriversbank.service;

import com.threeriversbank.client.AzureDevOpsClient;
import com.threeriversbank.model.dto.BacklogItemDto;
import com.threeriversbank.model.dto.WorkItemDto;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AzureDevOpsService {
    
    private final AzureDevOpsClient azureDevOpsClient;
    
    @Value("${azure.devops.organization:msft-common-demos}")
    private String organization;
    
    @Value("${azure.devops.default-project:msft-common-demos-adogh-crispy-carnival}")
    private String defaultProject;
    
    @CircuitBreaker(name = "azureDevOpsApi", fallbackMethod = "getUserStoriesFallback")
    @Retry(name = "azureDevOpsApi")
    @Cacheable(value = "userStories", unless = "#result == null")
    public List<WorkItemDto> getUserStories() {
        log.info("Fetching user stories from Azure DevOps");
        
        try {
            String wiqlQuery = "SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] " +
                             "FROM WorkItems WHERE [System.WorkItemType] = 'User Story' " +
                             "ORDER BY [System.ChangedDate] DESC";
            
            Map<String, Object> response = azureDevOpsClient.queryWorkItems(
                organization, 
                defaultProject, 
                wiqlQuery
            );
            
            return extractWorkItems(response);
        } catch (Exception e) {
            log.error("Error fetching user stories: {}", e.getMessage());
            throw e;
        }
    }
    
    @CircuitBreaker(name = "azureDevOpsApi", fallbackMethod = "getAllWorkItemsFallback")
    @Retry(name = "azureDevOpsApi")
    @Cacheable(value = "allWorkItems", unless = "#result == null")
    public List<WorkItemDto> getAllWorkItems() {
        log.info("Fetching all work items from Azure DevOps");
        
        try {
            String wiqlQuery = "SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], " +
                             "[System.AssignedTo], [System.CreatedDate] " +
                             "FROM WorkItems " +
                             "ORDER BY [System.ChangedDate] DESC";
            
            Map<String, Object> response = azureDevOpsClient.queryWorkItems(
                organization, 
                defaultProject, 
                wiqlQuery
            );
            
            return extractWorkItems(response);
        } catch (Exception e) {
            log.error("Error fetching all work items: {}", e.getMessage());
            throw e;
        }
    }
    
    @CircuitBreaker(name = "azureDevOpsApi", fallbackMethod = "getWorkItemByIdFallback")
    @Retry(name = "azureDevOpsApi")
    @Cacheable(value = "workItem", key = "#id", unless = "#result == null")
    public WorkItemDto getWorkItemById(Long id) {
        log.info("Fetching work item {} from Azure DevOps", id);
        
        try {
            Map<String, Object> response = azureDevOpsClient.getWorkItem(organization, defaultProject, id);
            return mapToWorkItemDto(response);
        } catch (Exception e) {
            log.error("Error fetching work item {}: {}", id, e.getMessage());
            throw e;
        }
    }
    
    @CircuitBreaker(name = "azureDevOpsApi", fallbackMethod = "getProjectBacklogFallback")
    @Retry(name = "azureDevOpsApi")
    @Cacheable(value = "projectBacklog", key = "#projectName", unless = "#result == null")
    public List<BacklogItemDto> getProjectBacklog(String projectName) {
        log.info("Fetching backlog for project: {}", projectName);
        
        try {
            String wiqlQuery = "SELECT [System.Id], [System.Title], [System.WorkItemType], [System.State], " +
                             "[System.AssignedTo], [Microsoft.VSTS.Scheduling.StoryPoints], " +
                             "[System.IterationPath] " +
                             "FROM WorkItems " +
                             "WHERE [System.WorkItemType] IN ('User Story', 'Bug', 'Task') " +
                             "AND [System.State] <> 'Removed' " +
                             "ORDER BY [Microsoft.VSTS.Common.Priority] ASC, [System.CreatedDate] DESC";
            
            Map<String, Object> response = azureDevOpsClient.queryWorkItems(
                organization, 
                projectName, 
                wiqlQuery
            );
            
            return extractBacklogItems(response);
        } catch (Exception e) {
            log.error("Error fetching project backlog for {}: {}", projectName, e.getMessage());
            throw e;
        }
    }
    
    // Fallback methods
    public List<WorkItemDto> getUserStoriesFallback(Exception e) {
        log.warn("Falling back to sample user stories due to: {}", e.getMessage());
        return getSampleUserStories();
    }
    
    public List<WorkItemDto> getAllWorkItemsFallback(Exception e) {
        log.warn("Falling back to sample work items due to: {}", e.getMessage());
        return getSampleWorkItems();
    }
    
    public WorkItemDto getWorkItemByIdFallback(Long id, Exception e) {
        log.warn("Falling back to sample work item {} due to: {}", id, e.getMessage());
        return getSampleWorkItem(id);
    }
    
    public List<BacklogItemDto> getProjectBacklogFallback(String projectName, Exception e) {
        log.warn("Falling back to sample backlog for {} due to: {}", projectName, e.getMessage());
        return getSampleBacklog();
    }
    
    // Helper methods
    private List<WorkItemDto> extractWorkItems(Map<String, Object> response) {
        if (response == null || !response.containsKey("workItems")) {
            return Collections.emptyList();
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> workItems = (List<Map<String, Object>>) response.get("workItems");
        
        if (workItems == null || workItems.isEmpty()) {
            return Collections.emptyList();
        }
        
        String ids = workItems.stream()
            .map(wi -> wi.get("id").toString())
            .collect(Collectors.joining(","));
        
        Map<String, Object> detailsResponse = azureDevOpsClient.getWorkItemsBatch(
            organization, 
            defaultProject, 
            ids
        );
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) detailsResponse.get("value");
        
        return items.stream()
            .map(this::mapToWorkItemDto)
            .collect(Collectors.toList());
    }
    
    private List<BacklogItemDto> extractBacklogItems(Map<String, Object> response) {
        if (response == null || !response.containsKey("workItems")) {
            return Collections.emptyList();
        }
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> workItems = (List<Map<String, Object>>) response.get("workItems");
        
        if (workItems == null || workItems.isEmpty()) {
            return Collections.emptyList();
        }
        
        String ids = workItems.stream()
            .map(wi -> wi.get("id").toString())
            .collect(Collectors.joining(","));
        
        Map<String, Object> detailsResponse = azureDevOpsClient.getWorkItemsBatch(
            organization, 
            defaultProject, 
            ids
        );
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) detailsResponse.get("value");
        
        return items.stream()
            .map(this::mapToBacklogItemDto)
            .collect(Collectors.toList());
    }
    
    @SuppressWarnings("unchecked")
    private WorkItemDto mapToWorkItemDto(Map<String, Object> item) {
        Map<String, Object> fields = (Map<String, Object>) item.get("fields");
        
        return WorkItemDto.builder()
            .id(((Number) item.get("id")).longValue())
            .title((String) fields.getOrDefault("System.Title", ""))
            .workItemType((String) fields.getOrDefault("System.WorkItemType", ""))
            .state((String) fields.getOrDefault("System.State", ""))
            .assignedTo(extractAssignedTo(fields))
            .createdBy(extractCreatedBy(fields))
            .createdDate(parseDateTime((String) fields.get("System.CreatedDate")))
            .changedDate(parseDateTime((String) fields.get("System.ChangedDate")))
            .description((String) fields.getOrDefault("System.Description", ""))
            .priority(extractPriority(fields))
            .areaPath((String) fields.getOrDefault("System.AreaPath", ""))
            .iterationPath((String) fields.getOrDefault("System.IterationPath", ""))
            .url((String) item.getOrDefault("url", ""))
            .build();
    }
    
    @SuppressWarnings("unchecked")
    private BacklogItemDto mapToBacklogItemDto(Map<String, Object> item) {
        Map<String, Object> fields = (Map<String, Object>) item.get("fields");
        
        return BacklogItemDto.builder()
            .id(((Number) item.get("id")).longValue())
            .title((String) fields.getOrDefault("System.Title", ""))
            .workItemType((String) fields.getOrDefault("System.WorkItemType", ""))
            .state((String) fields.getOrDefault("System.State", ""))
            .assignedTo(extractAssignedTo(fields))
            .priority(extractPriority(fields))
            .storyPoints(extractStoryPoints(fields))
            .iterationPath((String) fields.getOrDefault("System.IterationPath", ""))
            .createdDate(parseDateTime((String) fields.get("System.CreatedDate")))
            .url((String) item.getOrDefault("url", ""))
            .build();
    }
    
    @SuppressWarnings("unchecked")
    private String extractAssignedTo(Map<String, Object> fields) {
        Object assignedTo = fields.get("System.AssignedTo");
        if (assignedTo instanceof Map) {
            return (String) ((Map<String, Object>) assignedTo).getOrDefault("displayName", "Unassigned");
        } else if (assignedTo instanceof String) {
            return (String) assignedTo;
        }
        return "Unassigned";
    }
    
    @SuppressWarnings("unchecked")
    private String extractCreatedBy(Map<String, Object> fields) {
        Object createdBy = fields.get("System.CreatedBy");
        if (createdBy instanceof Map) {
            return (String) ((Map<String, Object>) createdBy).getOrDefault("displayName", "Unknown");
        } else if (createdBy instanceof String) {
            return (String) createdBy;
        }
        return "Unknown";
    }
    
    private Integer extractPriority(Map<String, Object> fields) {
        Object priority = fields.get("Microsoft.VSTS.Common.Priority");
        if (priority instanceof Number) {
            return ((Number) priority).intValue();
        }
        return null;
    }
    
    private Integer extractStoryPoints(Map<String, Object> fields) {
        Object storyPoints = fields.get("Microsoft.VSTS.Scheduling.StoryPoints");
        if (storyPoints instanceof Number) {
            return ((Number) storyPoints).intValue();
        }
        return null;
    }
    
    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null) return null;
        try {
            return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            log.warn("Error parsing date: {}", dateTimeStr);
            return null;
        }
    }
    
    // Sample data for fallback
    private List<WorkItemDto> getSampleUserStories() {
        return Arrays.asList(
            WorkItemDto.builder()
                .id(859L)
                .title("Implement Azure DevOps Integration")
                .workItemType("User Story")
                .state("Active")
                .assignedTo("John Doe")
                .createdBy("Jane Smith")
                .createdDate(LocalDateTime.now().minusDays(5))
                .changedDate(LocalDateTime.now().minusDays(1))
                .description("Add Azure DevOps API integration to fetch work items and backlog")
                .priority(1)
                .areaPath("msft-common-demos-adogh-crispy-carnival")
                .iterationPath("Sprint 1")
                .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/859")
                .build(),
            WorkItemDto.builder()
                .id(860L)
                .title("Create Work Item API Endpoints")
                .workItemType("User Story")
                .state("New")
                .assignedTo("Alice Johnson")
                .createdBy("Bob Wilson")
                .createdDate(LocalDateTime.now().minusDays(3))
                .changedDate(LocalDateTime.now().minusDays(2))
                .description("Implement REST API endpoints for work item operations")
                .priority(2)
                .areaPath("msft-common-demos-adogh-crispy-carnival")
                .iterationPath("Sprint 1")
                .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/860")
                .build()
        );
    }
    
    private List<WorkItemDto> getSampleWorkItems() {
        List<WorkItemDto> items = new ArrayList<>(getSampleUserStories());
        items.add(
            WorkItemDto.builder()
                .id(861L)
                .title("Fix authentication bug")
                .workItemType("Bug")
                .state("Active")
                .assignedTo("Charlie Brown")
                .createdBy("Diana Prince")
                .createdDate(LocalDateTime.now().minusDays(2))
                .changedDate(LocalDateTime.now().minusHours(12))
                .description("Users unable to authenticate with Azure AD")
                .priority(1)
                .areaPath("msft-common-demos-adogh-crispy-carnival")
                .iterationPath("Sprint 1")
                .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/861")
                .build()
        );
        return items;
    }
    
    private WorkItemDto getSampleWorkItem(Long id) {
        if (id == 859L) {
            return getSampleUserStories().get(0);
        }
        return WorkItemDto.builder()
            .id(id)
            .title("Sample Work Item " + id)
            .workItemType("User Story")
            .state("New")
            .assignedTo("Unassigned")
            .createdBy("System")
            .createdDate(LocalDateTime.now())
            .changedDate(LocalDateTime.now())
            .description("This is a sample work item used as fallback data")
            .priority(3)
            .areaPath("msft-common-demos-adogh-crispy-carnival")
            .iterationPath("Backlog")
            .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/" + id)
            .build();
    }
    
    private List<BacklogItemDto> getSampleBacklog() {
        return Arrays.asList(
            BacklogItemDto.builder()
                .id(859L)
                .title("Implement Azure DevOps Integration")
                .workItemType("User Story")
                .state("Active")
                .assignedTo("John Doe")
                .priority(1)
                .storyPoints(8)
                .iterationPath("Sprint 1")
                .createdDate(LocalDateTime.now().minusDays(5))
                .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/859")
                .build(),
            BacklogItemDto.builder()
                .id(860L)
                .title("Create Work Item API Endpoints")
                .workItemType("User Story")
                .state("New")
                .assignedTo("Alice Johnson")
                .priority(2)
                .storyPoints(5)
                .iterationPath("Sprint 1")
                .createdDate(LocalDateTime.now().minusDays(3))
                .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/860")
                .build(),
            BacklogItemDto.builder()
                .id(861L)
                .title("Fix authentication bug")
                .workItemType("Bug")
                .state("Active")
                .assignedTo("Charlie Brown")
                .priority(1)
                .storyPoints(3)
                .iterationPath("Sprint 1")
                .createdDate(LocalDateTime.now().minusDays(2))
                .url("https://dev.azure.com/msft-common-demos/msft-common-demos-adogh-crispy-carnival/_workitems/edit/861")
                .build()
        );
    }
}
