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
public class BacklogItemDto {
    private Long id;
    private String title;
    private String workItemType;
    private String state;
    private String assignedTo;
    private Integer priority;
    private Integer storyPoints;
    private String iterationPath;
    private LocalDateTime createdDate;
    private String url;
}
