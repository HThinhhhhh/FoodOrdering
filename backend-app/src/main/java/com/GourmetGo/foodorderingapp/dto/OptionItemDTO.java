package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OptionItemDTO {
    private Long id;
    private String name;
    private BigDecimal price; // Giá cộng thêm
}