package com.GourmetGo.foodorderingapp.model;

public enum MenuItemStatus {
    ON_SALE,             // Đang bán (Hiển thị và cho phép đặt)
    TEMP_OUT_OF_STOCK,   // Tạm hết hàng (Hiển thị nhưng không cho đặt)
    DISCONTINUED         // Ngừng bán (Ẩn hoàn toàn khỏi menu khách)
}