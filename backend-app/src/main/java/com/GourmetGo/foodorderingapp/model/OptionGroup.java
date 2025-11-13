package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Entity
@Table(name = "option_groups")
@Getter
@Setter
@NoArgsConstructor
public class OptionGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Ví dụ: "Chọn Size", "Chọn Topping", "Chọn Nước"

    // Liên kết ngược về Món ăn
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonBackReference("menu-item-option-group")
    private MenuItem menuItem;

    // Danh sách các tùy chọn con
    @OneToMany(mappedBy = "optionGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("group-option-item")
    private Set<OptionItem> options;
}