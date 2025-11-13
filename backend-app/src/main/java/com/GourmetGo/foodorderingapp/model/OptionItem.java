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

    /**
     * Giá cộng thêm (FR21, FR22).
     * 0.00 nếu là tùy chọn miễn phí (như "Không đá")
     * 5000.00 nếu là tùy chọn tính phí (như "+5k cho Size L")
     */
    @Column(nullable = false)
    private BigDecimal price;

    // Liên kết ngược về Nhóm
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id", nullable = false)
    @JsonBackReference("group-option-item")
    private OptionGroup optionGroup;
}