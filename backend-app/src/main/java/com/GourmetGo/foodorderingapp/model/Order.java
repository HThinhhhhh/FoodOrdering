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

    // ... (id, user, items, status, orderTime, pickupWindow giữ nguyên) ...
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-order")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("order-item")
    private Set<OrderItem> items;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @CreationTimestamp
    private LocalDateTime orderTime;

    private LocalDateTime pickupWindow;

    // ... (deliveryAddress, shipperNote, paymentMethod, chi phí giữ nguyên) ...
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

    // --- BẮT ĐẦU THÊM TRƯỜNG ĐÁNH GIÁ (Goal 1, 4) ---

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isReviewed = false; // (Goal 4: Chỉ review 1 lần)

    @Column(nullable = true)
    private Integer deliveryRating; // (Goal 3: Rating 1-5)

    @Column(nullable = true, length = 500)
    private String deliveryComment; // (Goal 1: Đánh giá giao hàng)

    // --- KẾT THÚC THÊM TRƯỜNG ĐÁNH GIÁ ---
}