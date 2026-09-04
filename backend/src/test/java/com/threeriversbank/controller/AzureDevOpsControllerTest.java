package com.threeriversbank.controller;

import com.threeriversbank.model.dto.BacklogItemDto;
import com.threeriversbank.model.dto.WorkItemDto;
import com.threeriversbank.service.AzureDevOpsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AzureDevOpsController.class)
class AzureDevOpsControllerTest {
    
    @Autowired
    private MockMvc mockMvc;
    
    @MockBean
    private AzureDevOpsService azureDevOpsService;
    
    @Test
    void getUserStories_ReturnsListOfUserStories() throws Exception {
        // Given
        List<WorkItemDto> userStories = Arrays.asList(
            WorkItemDto.builder()
                .id(859L)
                .title("Test User Story 1")
                .workItemType("User Story")
                .state("Active")
                .assignedTo("John Doe")
                .createdDate(LocalDateTime.now())
                .build(),
            WorkItemDto.builder()
                .id(860L)
                .title("Test User Story 2")
                .workItemType("User Story")
                .state("New")
                .assignedTo("Jane Smith")
                .createdDate(LocalDateTime.now())
                .build()
        );
        
        when(azureDevOpsService.getUserStories()).thenReturn(userStories);
        
        // When & Then
        mockMvc.perform(get("/api/workitems/user-stories"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].id").value(859))
            .andExpect(jsonPath("$[0].title").value("Test User Story 1"))
            .andExpect(jsonPath("$[0].workItemType").value("User Story"))
            .andExpect(jsonPath("$[1].id").value(860))
            .andExpect(jsonPath("$[1].title").value("Test User Story 2"));
    }
    
    @Test
    void getAllWorkItems_ReturnsListOfAllWorkItems() throws Exception {
        // Given
        List<WorkItemDto> workItems = Arrays.asList(
            WorkItemDto.builder()
                .id(861L)
                .title("Test Work Item")
                .workItemType("Task")
                .state("Active")
                .assignedTo("Bob Wilson")
                .createdDate(LocalDateTime.now())
                .build()
        );
        
        when(azureDevOpsService.getAllWorkItems()).thenReturn(workItems);
        
        // When & Then
        mockMvc.perform(get("/api/workitems"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").value(861))
            .andExpect(jsonPath("$[0].title").value("Test Work Item"))
            .andExpect(jsonPath("$[0].workItemType").value("Task"));
    }
    
    @Test
    void getWorkItemById_ReturnsWorkItemDetails() throws Exception {
        // Given
        WorkItemDto workItem = WorkItemDto.builder()
            .id(859L)
            .title("Implement Azure DevOps Integration")
            .workItemType("User Story")
            .state("Active")
            .assignedTo("John Doe")
            .description("Add Azure DevOps API integration")
            .priority(1)
            .createdDate(LocalDateTime.now())
            .build();
        
        when(azureDevOpsService.getWorkItemById(anyLong())).thenReturn(workItem);
        
        // When & Then
        mockMvc.perform(get("/api/workitems/859"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(859))
            .andExpect(jsonPath("$.title").value("Implement Azure DevOps Integration"))
            .andExpect(jsonPath("$.workItemType").value("User Story"))
            .andExpect(jsonPath("$.state").value("Active"))
            .andExpect(jsonPath("$.assignedTo").value("John Doe"))
            .andExpect(jsonPath("$.priority").value(1));
    }
    
    @Test
    void getProjectBacklog_ReturnsBacklogItems() throws Exception {
        // Given
        String projectName = "msft-common-demos-adogh-crispy-carnival";
        List<BacklogItemDto> backlogItems = Arrays.asList(
            BacklogItemDto.builder()
                .id(859L)
                .title("Backlog Item 1")
                .workItemType("User Story")
                .state("Active")
                .assignedTo("John Doe")
                .priority(1)
                .storyPoints(8)
                .createdDate(LocalDateTime.now())
                .build(),
            BacklogItemDto.builder()
                .id(860L)
                .title("Backlog Item 2")
                .workItemType("Bug")
                .state("New")
                .assignedTo("Jane Smith")
                .priority(2)
                .storyPoints(3)
                .createdDate(LocalDateTime.now())
                .build()
        );
        
        when(azureDevOpsService.getProjectBacklog(anyString())).thenReturn(backlogItems);
        
        // When & Then
        mockMvc.perform(get("/api/projects/" + projectName + "/backlog"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].id").value(859))
            .andExpect(jsonPath("$[0].title").value("Backlog Item 1"))
            .andExpect(jsonPath("$[0].storyPoints").value(8))
            .andExpect(jsonPath("$[1].id").value(860))
            .andExpect(jsonPath("$[1].title").value("Backlog Item 2"))
            .andExpect(jsonPath("$[1].storyPoints").value(3));
    }
}
