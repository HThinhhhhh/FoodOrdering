package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ApplyVoucherRequest {
    private String code;
    private BigDecimal subtotal; // Tạm tính của giỏ hàng
}