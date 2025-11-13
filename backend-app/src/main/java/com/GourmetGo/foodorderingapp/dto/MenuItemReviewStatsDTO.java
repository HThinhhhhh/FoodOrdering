package com.GourmetGo.foodorderingapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemReviewStatsDTO {
    private Long menuItemId;
    private Double averageRating;
    private Long reviewCount;
}