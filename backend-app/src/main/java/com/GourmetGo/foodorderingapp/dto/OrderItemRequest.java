package com.GourmetGo.foodorderingapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {
    /** ID của MenuItem */
    private Long menuItemId;

    /** Số lượng */
    private int quantity;
}