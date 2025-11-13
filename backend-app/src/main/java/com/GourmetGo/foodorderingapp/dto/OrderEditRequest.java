package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class OrderEditRequest {
    private String deliveryAddress;
    private String shipperNote;
}