package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;
import java.io.Serializable;

@Entity
@Table(name = "menu_items")
@Getter
@Setter
@NoArgsConstructor
public class MenuItem implements Serializable{

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(length = 1000)
    private String description;
    @Column(nullable = false)
    private BigDecimal price;
    private boolean vegetarian;
    private boolean spicy;
    private boolean popular;

    @Column(nullable = true, length = 1024)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItemCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItemStatus status;

    // (Các liên kết @OneToMany cũ giữ nguyên)
    @OneToMany(mappedBy = "menuItem")
    @JsonManagedReference("menu-item-order-item")
    private Set<OrderItem> orderItems;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("menu-item-review")
    private Set<Review> reviews;

    // --- BẮT ĐẦU THÊM MỚI ---
    /**
     * Danh sách các nhóm tùy chọn cho món ăn này
     * (Ví dụ: Món "Trà sữa" có nhóm "Chọn Size", "Chọn Topping")
     */
    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("menu-item-option-group")
    private Set<OptionGroup> optionGroups;
    // --- KẾT THÚC THÊM MỚI ---
}