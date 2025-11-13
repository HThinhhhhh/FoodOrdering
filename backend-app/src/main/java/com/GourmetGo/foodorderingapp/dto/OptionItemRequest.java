package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OptionItemRequest {
    private String name;
    private BigDecimal price;
    private Long linkedMenuItemId; // ID của món ăn muốn link tới
}