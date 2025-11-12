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

    // (serialVersionUID, id, name, description, price, isVegetarian, isSpicy, isPopular giữ nguyên)
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
    private boolean isVegetarian;
    private boolean isSpicy;
    private boolean isPopular;

    // --- BẮT ĐẦU THÊM TRƯỜNG MỚI ---

    /** URL hình ảnh của món ăn */
    @Column(nullable = true, length = 1024)
    private String imageUrl;

    /** Phân loại món ăn (món chính, tráng miệng, v.v.) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItemCategory category;

    /** Trạng thái (đang bán, hết hàng, ngừng bán) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MenuItemStatus status;

    // --- KẾT THÚC THÊM TRƯỜNG MỚI ---


    // (Các liên kết @OneToMany giữ nguyên)
    @OneToMany(mappedBy = "menuItem")
    @JsonManagedReference("menu-item-order-item")
    private Set<OrderItem> orderItems;

    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("menu-item-review")
    private Set<Review> reviews;
}