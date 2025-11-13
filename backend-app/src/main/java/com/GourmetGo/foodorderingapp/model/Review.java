package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp; // <-- THÊM IMPORT
import java.time.LocalDateTime; // <-- THÊM IMPORT

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) // Thêm FetchType LAZY
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonBackReference("item-review")
    private MenuItem menuItem;

    @ManyToOne(fetch = FetchType.LAZY) // Thêm FetchType LAZY
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference("customer-review")
    private Customer customer;

    @Column(nullable = false)
    private int rating;

    @Column(nullable = true, length = 500)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY) // Thêm FetchType LAZY
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-review")
    private Order order;

    // --- THÊM TRƯỜNG MỚI ---
    @CreationTimestamp
    private LocalDateTime reviewTime;
    // --- KẾT THÚC THÊM MỚI ---
}