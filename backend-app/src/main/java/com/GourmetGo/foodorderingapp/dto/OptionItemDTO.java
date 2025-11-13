package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OptionItemDTO {
    private Long id;
    private String name;
    private BigDecimal price;

    // --- THÊM MỚI ---
    private Long linkedMenuItemId; // ID của MenuItem mà nó liên kết tới (nếu có)
    // --- KẾT THÚC THÊM MỚI ---
}