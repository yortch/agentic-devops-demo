package com.threeriversbank.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkItemDto {
    private Long id;
    private String title;
    private String workItemType;
    private String state;
    private String assignedTo;
    private String createdBy;
    private LocalDateTime createdDate;
    private LocalDateTime changedDate;
    private String description;
    private Integer priority;
    private String areaPath;
    private String iterationPath;
    private String url;
}
