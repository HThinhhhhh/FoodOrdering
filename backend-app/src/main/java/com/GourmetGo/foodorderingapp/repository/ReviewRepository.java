package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Tìm tất cả đánh giá cho một món ăn cụ thể
    List<Review> findByMenuItemId(Long menuItemId);
}