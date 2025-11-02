package com.GourmetGo.foodorderingapp.dto;

// --- BẮT ĐẦU: THÊM IMPORT MỚI ---
import java.math.BigDecimal;
// --- KẾT THÚC: THÊM IMPORT MỚI ---

public class MenuItemDTO {

    private Long id;
    private String name;
    private String description;

    // --- SỬA ĐỔI 1: Thay đổi kiểu dữ liệu ---
    // Từ: private Double price;
    // Thành:
    private BigDecimal price;

    private boolean isVegetarian;
    private boolean isSpicy;
    private boolean isPopular;

    public MenuItemDTO() {
    }

    // --- SỬA ĐỔI 2: Thay đổi kiểu trong Constructor ---
    // Từ: public MenuItemDTO(..., Double price, ...)
    // Thành:
    public MenuItemDTO(Long id, String name, String description, BigDecimal price, boolean isVegetarian, boolean isSpicy, boolean isPopular) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.isVegetarian = isVegetarian;
        this.isSpicy = isSpicy;
        this.isPopular = isPopular;
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
}