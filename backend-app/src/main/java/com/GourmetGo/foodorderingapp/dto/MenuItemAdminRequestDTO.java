package com.GourmetGo.foodorderingapp.dto;

import com.GourmetGo.foodorderingapp.model.MenuItemCategory;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import lombok.Data;
import java.math.BigDecimal;

// DTO này được sử dụng khi TẠO MỚI hoặc CẬP NHẬT một món ăn từ Admin
@Data
public class MenuItemAdminRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private MenuItemCategory category;
    private MenuItemStatus status;
    private boolean isVegetarian;
    private boolean isSpicy;
    private boolean isPopular;
}