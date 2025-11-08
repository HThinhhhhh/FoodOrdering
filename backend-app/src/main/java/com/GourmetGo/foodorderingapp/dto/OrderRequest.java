package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal; // <-- Thêm import
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderRequest {
    private Long userId;
    private List<OrderItemRequest> items;
    private LocalDateTime pickupWindow; // (Trường này có thể bị loại bỏ nếu chỉ giao hàng)

    // --- THÊM CÁC TRƯỜNG MỚI (Goal 3, 4, 6) ---
    private String deliveryAddress; // Địa chỉ đầy đủ (đã ghép)
    private String shipperNote;
    private String paymentMethod;

    private BigDecimal subtotal;
    private BigDecimal vatAmount;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;
    // --- KẾT THÚC THÊM TRƯỜỜNG MỚI ---
}