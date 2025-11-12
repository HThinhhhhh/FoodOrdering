package com.GourmetGo.foodorderingapp.dto;
import java.math.BigDecimal;
import com.GourmetGo.foodorderingapp.model.MenuItemCategory;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;

public class MenuItemDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean isVegetarian;
    private boolean isSpicy;
    private boolean isPopular;

    // --- THÊM CÁC TRƯỜNG MỚI ---
    private String imageUrl;
    private MenuItemCategory category;
    private MenuItemStatus status;
    // --- KẾT THÚC THÊM TRƯỜNG MỚI ---

    // --- SỬA ĐỔI CONSTRUCTOR ---
    public MenuItemDTO(Long id, String name, String description, BigDecimal price,
                       boolean isVegetarian, boolean isSpicy, boolean isPopular,
                       String imageUrl, MenuItemCategory category, MenuItemStatus status) { // Thêm 3 tham số
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.isVegetarian = isVegetarian;
        this.isSpicy = isSpicy;
        this.isPopular = isPopular;
        // Gán các giá trị mới
        this.imageUrl = imageUrl;
        this.category = category;
        this.status = status;
    }

    // --- SỬA ĐỔI 3 & 4: Thay đổi kiểu trong Getter và Setter ---
    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    // (Các getter/setter khác giữ nguyên)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isVegetarian() {
        return isVegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        isVegetarian = vegetarian;
    }

    public boolean isSpicy() {
        return isSpicy;
    }

    public void setSpicy(boolean spicy) {
        isSpicy = spicy;
    }

    public boolean isPopular() {
        return isPopular;
    }

    public void setPopular(boolean popular) {
        isPopular = popular;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public MenuItemCategory getCategory() {
        return category;
    }

    public void setCategory(MenuItemCategory category) {
        this.category = category;
    }

    public MenuItemStatus getStatus() {
        return status;
    }

    public void setStatus(MenuItemStatus status) {
        this.status = status;
    }
}