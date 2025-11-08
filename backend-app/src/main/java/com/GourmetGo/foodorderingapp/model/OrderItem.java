package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

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

    /** Đơn hàng chứa mục này */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-order-item")
    private Order order;

    /** Món ăn được chọn */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonBackReference("menu-item-order-item")
    private MenuItem menuItem;

    /** Số lượng món này được đặt */
    @Column(nullable = false)
    private int quantity;

    // --- THÊM TRƯỜNG MỚI ---
    @Column(nullable = true) // Cho phép ghi chú là null (không bắt buộc)
    private String note;
    // --- KẾT THÚC THÊM TRƯỜNG MỚI ---
}