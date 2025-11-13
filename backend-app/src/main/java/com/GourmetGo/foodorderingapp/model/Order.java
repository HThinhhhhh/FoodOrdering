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

    // ... (Các trường từ id đến employeeNote giữ nguyên)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonBackReference("customer-order")
    private Customer customer;

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
    @Column(nullable = true, length = 500)
    private String kitchenNote;
    @Column(nullable = true, length = 500)
    private String deliveryNote;
    @Column(nullable = true, length = 500)
    private String employeeNote;

    // --- THÊM 2 TRƯỜNG VOUCHER ---
    /** Mã voucher đã áp dụng (ví dụ: "WELCOME50") */
    @Column(nullable = true)
    private String voucherCode;

    /** Số tiền đã được giảm (đã tính toán) */
    @Column(nullable = true)
    private BigDecimal discountAmount;
    // --- KẾT THÚC THÊM MỚI ---
}