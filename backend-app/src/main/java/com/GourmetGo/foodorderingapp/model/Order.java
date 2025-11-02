package com.GourmetGo.foodorderingapp.model;

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

    /** Người dùng đã đặt đơn hàng này */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Trạng thái hiện tại của đơn hàng (RECEIVED, PREPARING, READY) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    /** Khung giờ hẹn lấy hàng (ví dụ: 12:30 PM - 12:45 PM) */
    @Column(nullable = false)
    private LocalDateTime pickupWindow; // Hoặc có thể dùng String nếu đơn giản

    /** Thời điểm đơn hàng được tạo (do hệ thống gán) */
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime orderTime;

    /** Tổng số tiền của đơn hàng */
    @Column(nullable = false)
    private BigDecimal totalAmount;

    /** Danh sách các món trong đơn hàng */
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> items;
}
