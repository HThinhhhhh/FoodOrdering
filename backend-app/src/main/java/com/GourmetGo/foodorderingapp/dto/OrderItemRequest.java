package com.GourmetGo.foodorderingapp.dto;

import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal; // <-- THÊM IMPORT

@Getter
@Setter
public class OrderItemRequest {
    private Long menuItemId;
    private int quantity;
    private String note;

    // --- THÊM 2 TRƯỜNG MỚI (Từ Frontend) ---
    private BigDecimal pricePerUnit; // Giá cuối cùng của 1 item (đã tính options)
    private String selectedOptionsText; // Chuỗi mô tả các options đã chọn
    // --- KẾT THÚC THÊM MỚI ---
}