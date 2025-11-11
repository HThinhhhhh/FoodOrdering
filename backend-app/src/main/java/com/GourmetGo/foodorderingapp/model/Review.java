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

    // --- THAY ĐỔI LIÊN KẾT ---
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false) // Đổi từ user_id
    @JsonBackReference("customer-review") // Đổi từ user-review
    private Customer customer; // Đổi từ User
    // --- KẾT THÚC THAY ĐỔI ---

    @Column(nullable = false)
    private int rating;

    @Column(nullable = true, length = 500)
    private String comment;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-review")
    private Order order;
}