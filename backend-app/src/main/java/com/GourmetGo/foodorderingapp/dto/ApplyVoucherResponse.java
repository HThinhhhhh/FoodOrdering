package com.GourmetGo.foodorderingapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ApplyVoucherResponse {
    private String code;
    private BigDecimal discountAmount; // Số tiền đã giảm cuối cùng
    private String description;
}