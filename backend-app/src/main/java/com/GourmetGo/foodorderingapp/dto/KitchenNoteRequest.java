package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class KitchenNoteRequest {
    private Long orderId;
    private String note;
}