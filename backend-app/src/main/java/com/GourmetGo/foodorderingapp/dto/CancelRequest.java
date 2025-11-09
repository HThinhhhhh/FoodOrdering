package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class CancelRequest {
    private Long orderId;
    private String reason;
}