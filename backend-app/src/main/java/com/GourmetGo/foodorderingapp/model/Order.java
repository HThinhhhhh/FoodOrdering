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
    private String shipperNote; // Ghi chú của Khách hàng cho Shipper
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

    /** Ghi chú nội bộ của Bếp (khách hàng không thấy) */
    @Column(nullable = true, length = 500)
    private String kitchenNote;

    /** Ghi chú giao hàng (vd: Tên Shipper, SĐT) - (Khách hàng CÓ THỂ thấy) */
    @Column(nullable = true, length = 500)
    private String deliveryNote;

    // --- THÊM TRƯỜNG MỚI ---
    /** Ghi chú của Nhân viên/Admin (khách hàng không thấy) */
    @Column(nullable = true, length = 500)
    private String employeeNote;
    // --- KẾT THÚC THÊM TRƯỜNG MỚI ---
}