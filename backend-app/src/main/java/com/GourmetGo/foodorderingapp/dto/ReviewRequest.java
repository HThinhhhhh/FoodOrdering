package com.GourmetGo.foodorderingapp.dto;

import lombok.Getter;
import lombok.Setter;

// DTO này chỉ chứa ID của các đối tượng liên quan và dữ liệu mới
@Getter
@Setter
public class ReviewRequest {
    private Long menuItemId;
    private Long userId; // Trong ứng dụng thực tế, ID này nên được lấy từ người dùng đã đăng nhập
    private int rating;
    private String comment;
}
