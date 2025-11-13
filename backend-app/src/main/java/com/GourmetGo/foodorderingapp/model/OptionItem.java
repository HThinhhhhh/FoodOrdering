package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "option_items")
@Getter
@Setter
@NoArgsConstructor
public class OptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Ví dụ: "Size L", "Coca-Cola", "Trân châu đen"

    @Column(nullable = false)
    private BigDecimal price; // Giá cộng thêm (Vd: +5k cho Size L)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id", nullable = false)
    @JsonBackReference("group-option-item")
    private OptionGroup optionGroup;

    // --- BẮT ĐẦU THÊM MỚI ---
    /**
     * Liên kết tùy chọn này với một MÓN ĂN khác.
     * Dùng cho Combo (Vd: Option "Coca-Cola" -> link tới MenuItem "Coca-Cola")
     * (nullable = true vì "Size L" không link tới món nào cả)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_menu_item_id", nullable = true)
    private MenuItem linkedMenuItem;
    // --- KẾT THÚC THÊM MỚI ---
}