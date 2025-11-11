package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- THAY ĐỔI LIÊN KẾT ---
    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false) // Đổi từ user_id
    @JsonBackReference("customer-order") // Đổi từ user-order
    private Customer customer; // Đổi từ User
    // --- KẾT THÚC THAY ĐỔI ---

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("order-item")
    private Set<OrderItem> items;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @CreationTimestamp
    private LocalDateTime orderTime;

    private LocalDateTime pickupWindow;

    @Column(nullable = true)
    private String deliveryAddress;
    @Column(nullable = true)
    private String shipperNote;
    @Column(nullable = false)
    private String paymentMethod;
    @Column(nullable = false)
    private BigDecimal subtotal;
    @Column(nullable = false)
    private BigDecimal vatAmount;
    @Column(nullable = false)
    private BigDecimal shippingFee;
    @Column(nullable = false)
    private BigDecimal grandTotal;
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isReviewed = false;
    @Column(nullable = true)
    private Integer deliveryRating;
    @Column(nullable = true, length = 500)
    private String deliveryComment;
    @Column(nullable = true, length = 500)
    private String cancellationReason;
}