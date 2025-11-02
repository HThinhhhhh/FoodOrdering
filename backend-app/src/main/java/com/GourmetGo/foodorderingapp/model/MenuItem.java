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

    // (Thêm dòng này để Java bớt "cảnh báo")
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Tên món ăn */
    @Column(nullable = false)
    private String name;

    /** Mô tả chi tiết món ăn */
    @Column(length = 1000) // Tăng độ dài cho mô tả
    private String description;

    /** Giá món ăn (dùng BigDecimal cho tiền tệ) */
    @Column(nullable = false)
    private BigDecimal price;

    /** Món này có phải là món chay không? */
    private boolean isVegetarian;

    /** Món này có cay không? */
    private boolean isSpicy;

    /** Món này có phổ biến/được đề xuất không? */
    private boolean isPopular;

    // Quan hệ: Một MenuItem có thể được gọi trong nhiều OrderItem
    @OneToMany(mappedBy = "menuItem")
    @JsonManagedReference("menu-item-order-item")
    private Set<OrderItem> orderItems;

    // Quan hệ: Một MenuItem có thể có nhiều Review
    @OneToMany(mappedBy = "menuItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("menu-item-review")
    private Set<Review> reviews;
}