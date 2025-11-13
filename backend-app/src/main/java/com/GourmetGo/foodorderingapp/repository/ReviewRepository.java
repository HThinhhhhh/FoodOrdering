package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map; // <-- THÊM IMPORT

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMenuItemId(Long menuItemId);

    // --- BẮT ĐẦU: THÊM CÁC HÀM MỚI ---

    /** (ADMIN) Lấy tất cả đánh giá món ăn, sắp xếp mới nhất trước */
    List<Review> findAllByOrderByReviewTimeDesc();

    /**
     * (ADMIN - THỐNG KÊ) Lấy Rating Trung bình (AVG) và Tổng số (COUNT)
     */
    @Query(value =
            "SELECT " +
                    "   menu_item_id as menuItemId, " +
                    "   AVG(rating) as averageRating, " +
                    "   COUNT(id) as reviewCount " +
                    "FROM reviews " +
                    "GROUP BY menu_item_id",
            nativeQuery = true)
    List<Map<String, Object>> getMenuItemReviewStats();

    // --- KẾT THÚC: THÊM CÁC HÀM MỚI ---
}