package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;
import java.math.BigDecimal; // <-- THÊM IMPORT

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem implements Serializable{

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-order-item")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonBackReference("menu-item-order-item")
    private MenuItem menuItem;

    @Column(nullable = false)
    private int quantity;

    @Column(nullable = true)
    private String note;

    // --- BẮT ĐẦU THÊM MỚI ---
    /**
     * Giá cuối cùng của 1 item (đã bao gồm giá gốc + giá options)
     * (FR22)
     */
    @Column(nullable = false)
    private BigDecimal pricePerUnit;

    /**
     * Lưu trữ các tùy chọn đã chọn dưới dạng văn bản (để Bếp đọc)
     * Ví dụ: "Size L (+15k), Thêm trứng (+5k)" (FR9, FR21)
     */
    @Column(nullable = true, length = 1000)
    private String selectedOptionsText;
    // --- KẾT THÚC THÊM MỚI ---
}