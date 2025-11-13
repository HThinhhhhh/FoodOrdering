package com.GourmetGo.foodorderingapp.dto;

import com.GourmetGo.foodorderingapp.model.MenuItemCategory;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MenuItemAdminRequestDTO {
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private MenuItemCategory category;
    private MenuItemStatus status;
    private boolean vegetarian;
    private boolean spicy;
    private boolean popular;
}