package com.GourmetGo.foodorderingapp.dto;

import com.GourmetGo.foodorderingapp.model.MenuItemCategory;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import lombok.Data; // <-- 1. THÊM IMPORT

import java.math.BigDecimal;
import java.util.List; // <-- 2. THÊM IMPORT

@Data // <-- 3. THÊM ANNOTATION
public class MenuItemDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean vegetarian;
    private boolean spicy;
    private boolean popular;

    private String imageUrl;
    private MenuItemCategory category;
    private MenuItemStatus status;

    // --- 4. THÊM TRƯỜNG MỚI ---
    private List<OptionGroupDTO> optionGroups;
    // --- KẾT THÚC THÊM MỚI ---

    public MenuItemDTO() {
    }

    // (Constructor cũ không còn cần thiết nếu dùng @Data)
    // (Các hàm Getter/Setter cũ không còn cần thiết nếu dùng @Data)
}