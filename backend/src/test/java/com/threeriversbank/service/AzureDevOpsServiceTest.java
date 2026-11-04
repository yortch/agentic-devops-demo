package com.threeriversbank.service;

import com.threeriversbank.client.AzureDevOpsClient;
import com.threeriversbank.model.dto.BacklogItemDto;
import com.threeriversbank.model.dto.WorkItemDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AzureDevOpsServiceTest {
    
    @Mock
    private AzureDevOpsClient azureDevOpsClient;
    
    @InjectMocks
    private AzureDevOpsService azureDevOpsService;
    
    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(azureDevOpsService, "organization", "msft-common-demos");
        ReflectionTestUtils.setField(azureDevOpsService, "defaultProject", "msft-common-demos-adogh-crispy-carnival");
    }
    
    @Test
    void getUserStories_ReturnsUserStoriesFromApi() {
        // Given
        Map<String, Object> queryResponse = new HashMap<>();
        List<Map<String, Object>> workItems = new ArrayList<>();
        Map<String, Object> workItem = new HashMap<>();
        workItem.put("id", 859);
        workItems.add(workItem);
        queryResponse.put("workItems", workItems);
        
        Map<String, Object> detailsResponse = new HashMap<>();
        List<Map<String, Object>> valueList = new ArrayList<>();
        Map<String, Object> item = createWorkItemMap(859L, "Test User Story", "User Story", "Active");
        valueList.add(item);
        detailsResponse.put("value", valueList);
        
        when(azureDevOpsClient.queryWorkItems(anyString(), anyString(), anyString()))
            .thenReturn(queryResponse);
        when(azureDevOpsClient.getWorkItemsBatch(anyString(), anyString(), anyString()))
            .thenReturn(detailsResponse);
        
        // When
        List<WorkItemDto> result = azureDevOpsService.getUserStories();
        
        // Then
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getId()).isEqualTo(859L);
        assertThat(result.get(0).getTitle()).isEqualTo("Test User Story");
        assertThat(result.get(0).getWorkItemType()).isEqualTo("User Story");
    }
    
    @Test
    void getUserStories_FallsBackOnError() {
        // When - Call the fallback method directly since circuit breaker isn't active in unit tests
        List<WorkItemDto> result = azureDevOpsService.getUserStoriesFallback(new RuntimeException("API Error"));
        
        // Then - Should return fallback sample data
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(2);
    }
    
    @Test
    void getAllWorkItems_ReturnsAllWorkItemsFromApi() {
        // Given
        Map<String, Object> queryResponse = new HashMap<>();
        List<Map<String, Object>> workItems = new ArrayList<>();
        Map<String, Object> workItem = new HashMap<>();
        workItem.put("id", 860);
        workItems.add(workItem);
        queryResponse.put("workItems", workItems);
        
        Map<String, Object> detailsResponse = new HashMap<>();
        List<Map<String, Object>> valueList = new ArrayList<>();
        Map<String, Object> item = createWorkItemMap(860L, "Test Work Item", "Task", "New");
        valueList.add(item);
        detailsResponse.put("value", valueList);
        
        when(azureDevOpsClient.queryWorkItems(anyString(), anyString(), anyString()))
            .thenReturn(queryResponse);
        when(azureDevOpsClient.getWorkItemsBatch(anyString(), anyString(), anyString()))
            .thenReturn(detailsResponse);
        
        // When
        List<WorkItemDto> result = azureDevOpsService.getAllWorkItems();
        
        // Then
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getId()).isEqualTo(860L);
        assertThat(result.get(0).getTitle()).isEqualTo("Test Work Item");
    }
    
    @Test
    void getWorkItemById_ReturnsWorkItemDetails() {
        // Given
        Long workItemId = 859L;
        Map<String, Object> workItem = createWorkItemMap(workItemId, "Test Work Item 859", "User Story", "Active");
        
        when(azureDevOpsClient.getWorkItem(anyString(), anyString(), eq(workItemId)))
            .thenReturn(workItem);
        
        // When
        WorkItemDto result = azureDevOpsService.getWorkItemById(workItemId);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(workItemId);
        assertThat(result.getTitle()).isEqualTo("Test Work Item 859");
    }
    
    @Test
    void getWorkItemById_FallsBackOnError() {
        // Given
        Long workItemId = 999L;
        
        // When - Call the fallback method directly since circuit breaker isn't active in unit tests
        WorkItemDto result = azureDevOpsService.getWorkItemByIdFallback(workItemId, new RuntimeException("API Error"));
        
        // Then - Should return fallback sample data
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(workItemId);
        assertThat(result.getTitle()).contains("Sample Work Item");
    }
    
    @Test
    void getProjectBacklog_ReturnsBacklogItems() {
        // Given
        String projectName = "test-project";
        Map<String, Object> queryResponse = new HashMap<>();
        List<Map<String, Object>> workItems = new ArrayList<>();
        Map<String, Object> workItem = new HashMap<>();
        workItem.put("id", 861);
        workItems.add(workItem);
        queryResponse.put("workItems", workItems);
        
        Map<String, Object> detailsResponse = new HashMap<>();
        List<Map<String, Object>> valueList = new ArrayList<>();
        Map<String, Object> item = createWorkItemMap(861L, "Backlog Item", "User Story", "New");
        valueList.add(item);
        detailsResponse.put("value", valueList);
        
        when(azureDevOpsClient.queryWorkItems(anyString(), eq(projectName), anyString()))
            .thenReturn(queryResponse);
        when(azureDevOpsClient.getWorkItemsBatch(anyString(), anyString(), anyString()))
            .thenReturn(detailsResponse);
        
        // When
        List<BacklogItemDto> result = azureDevOpsService.getProjectBacklog(projectName);
        
        // Then
        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getId()).isEqualTo(861L);
        assertThat(result.get(0).getTitle()).isEqualTo("Backlog Item");
    }
    
    @Test
    void getProjectBacklog_FallsBackOnError() {
        // Given
        String projectName = "failing-project";
        
        // When - Call the fallback method directly since circuit breaker isn't active in unit tests
        List<BacklogItemDto> result = azureDevOpsService.getProjectBacklogFallback(projectName, new RuntimeException("API Error"));
        
        // Then - Should return fallback sample data
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(3);
    }
    
    private Map<String, Object> createWorkItemMap(Long id, String title, String type, String state) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", id);
        item.put("url", "https://dev.azure.com/test/_workitems/edit/" + id);
        
        Map<String, Object> fields = new HashMap<>();
        fields.put("System.Title", title);
        fields.put("System.WorkItemType", type);
        fields.put("System.State", state);
        fields.put("System.AssignedTo", "Test User");
        fields.put("System.CreatedBy", "Test Creator");
        fields.put("System.CreatedDate", "2026-02-01T10:00:00Z");
        fields.put("System.ChangedDate", "2026-02-05T10:00:00Z");
        fields.put("System.Description", "Test description");
        fields.put("Microsoft.VSTS.Common.Priority", 1);
        fields.put("System.AreaPath", "Test Area");
        fields.put("System.IterationPath", "Sprint 1");
        fields.put("Microsoft.VSTS.Scheduling.StoryPoints", 5);
        
        item.put("fields", fields);
        return item;
    }
}
