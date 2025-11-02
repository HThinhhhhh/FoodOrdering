package com.GourmetGo.foodorderingapp.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderRequest {

    /** * ID của người dùng (Trong ứng dụng thực tế, ID này nên được lấy
     * từ thông tin xác thực, không phải client gửi lên)
     */
    private Long userId;

    /** Danh sách các món hàng trong giỏ */
    private List<OrderItemRequest> items;

    /** Khung giờ khách hàng muốn nhận món */
    private LocalDateTime pickupWindow;
}
