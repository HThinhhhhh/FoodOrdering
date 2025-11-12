package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class DeliveryNoteRequest {
    private Long orderId;
    private String note;
}