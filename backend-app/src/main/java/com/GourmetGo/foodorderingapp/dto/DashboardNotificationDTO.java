package com.GourmetGo.foodorderingapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DashboardNotificationDTO {
    private String type; // "ITEM", "ORDER", "REVIEW"
    private String message;
    private Long count;
}