package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderRequest {

    private Long userId;
    private List<OrderItemRequest> items;

    private String deliveryAddress;
    private String shipperNote;
    private String paymentMethod;
    private LocalDateTime pickupWindow;

    private BigDecimal subtotal;
    private BigDecimal vatAmount;
    private BigDecimal shippingFee;
    private BigDecimal grandTotal;

    // --- THÊM 2 TRƯỜNG VOUCHER ---
    private String voucherCode;
    private BigDecimal discountAmount;
    // --- KẾT THÚC THÊM MỚI ---
}