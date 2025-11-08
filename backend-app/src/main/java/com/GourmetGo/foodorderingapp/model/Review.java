package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonBackReference("item-review")
    private MenuItem menuItem;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-review")
    private User user;

    @Column(nullable = false)
    private int rating; // (Goal 3: Rating 1-5)

    @Column(nullable = true, length = 500)
    private String comment;

    // --- BẮT ĐẦU THÊM LIÊN KẾT VỚI ORDER ---
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false) // Mọi đánh giá món ăn phải thuộc 1 đơn hàng
    @JsonBackReference("order-review")
    private Order order;
    // --- KẾT THÚC THÊM LIÊN KẾT ---
}