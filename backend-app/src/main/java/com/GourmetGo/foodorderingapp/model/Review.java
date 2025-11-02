package com.GourmetGo.foodorderingapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
public class Review implements Serializable{

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Món ăn được đánh giá */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    @JsonBackReference("menu-item-review")
    private MenuItem menuItem;

    /** Người dùng viết đánh giá */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-review")
    private User user;

    /** Điểm đánh giá (từ 1 đến 5 sao) */
    @Column(nullable = false)
    private int rating;

    /** Nội dung bình luận (có thể không có) */
    @Column(length = 1000)
    private String comment;
}