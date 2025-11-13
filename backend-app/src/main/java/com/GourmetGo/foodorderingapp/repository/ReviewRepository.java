package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param; // <-- THÊM IMPORT
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime; // <-- THÊM IMPORT
import java.util.List;
import java.util.Map;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByMenuItemId(Long menuItemId);

    List<Review> findAllByOrderByReviewTimeDesc();

    /**
     * (THỐNG KÊ TỔNG) Lấy Rating Trung bình (AVG) và Tổng số (COUNT)
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

    /**
     * (THỐNG KÊ THEO NGÀY) Lấy Rating Trung bình (AVG) và Tổng số (COUNT)
     * TRONG MỘT KHOẢNG THỜI GIAN (dựa trên reviewTime)
     */
    @Query(value =
            "SELECT " +
                    "   menu_item_id as menuItemId, " +
                    "   AVG(rating) as averageRating, " +
                    "   COUNT(id) as reviewCount " +
                    "FROM reviews " +
                    "WHERE review_time >= :startDate AND review_time <= :endDate " +
                    "GROUP BY menu_item_id",
            nativeQuery = true)
    List<Map<String, Object>> getMenuItemReviewStatsByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // --- BẮT ĐẦU THÊM MỚI (CHO DASHBOARD) ---
    /**
     * Đếm số lượng đánh giá mới kể từ một mốc thời gian
     */
    Long countByReviewTimeAfter(LocalDateTime dateTime);
    // --- KẾT THÚC THÊM MỚI ---
}