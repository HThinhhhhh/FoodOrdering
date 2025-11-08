package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class ItemReviewRequest {
    private Long menuItemId;
    private int rating;
    private String comment;
}