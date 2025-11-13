package com.GourmetGo.foodorderingapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // Mã giảm giá, ví dụ: "WELCOME50"

    @Column(nullable = false)
    private String description; // Mô tả: "Giảm 50k cho đơn hàng đầu tiên"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType; // PERCENTAGE hoặc FIXED_AMOUNT

    @Column(nullable = false)
    private BigDecimal discountValue; // Giá trị: 20 (cho 20%) hoặc 50000 (cho 50k)

    // --- THÊM TRƯỜNG MỚI ---
    /** Giảm tối đa (chỉ áp dụng cho PERCENTAGE). Null nghĩa là không giới hạn. */
    @Column(nullable = true)
    private BigDecimal maxDiscountAmount;
    // --- KẾT THÚC THÊM MỚI ---

    @Column(nullable = true) // Null nghĩa là không yêu cầu
    private BigDecimal minimumSpend; // Yêu cầu chi tiêu tối thiểu

    @Column(nullable = true) // Null nghĩa là không giới hạn
    private Integer usageLimit; // Tổng số lượt sử dụng tối đa

    @Column(nullable = false)
    private int currentUsage = 0; // Số lượt đã sử dụng

    @Column(nullable = false)
    private LocalDateTime startDate; // Ngày bắt đầu

    @Column(nullable = false)
    private LocalDateTime endDate; // Ngày kết thúc

    @Column(nullable = false)
    private boolean isActive = true; // Admin có thể bật/tắt
}