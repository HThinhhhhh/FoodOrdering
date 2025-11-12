package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class OrderEditRequest {
    // Hiện tại chỉ cho phép sửa 2 trường này
    private String deliveryAddress;
    private String shipperNote;
    // (Trong tương lai có thể thêm List<OrderItemRequest> items)
}