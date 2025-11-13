package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.AdminReviewDTO;
import com.GourmetGo.foodorderingapp.dto.MenuItemReviewStatsDTO;
import com.GourmetGo.foodorderingapp.model.Customer;
import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.Review;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import com.GourmetGo.foodorderingapp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public List<AdminReviewDTO> getAllFoodReviews() {
        List<Review> reviews = reviewRepository.findAllByOrderByReviewTimeDesc();
        return reviews.stream()
                .map(this::convertReviewToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Order> getAllDeliveryReviews() {
        return orderRepository.findByDeliveryRatingIsNotNullOrderByOrderTimeDesc();
    }

    @Transactional(readOnly = true)
    public Map<Long, MenuItemReviewStatsDTO> getReviewStats(
            LocalDateTime startDate, LocalDateTime endDate) { // <-- THÊM THAM SỐ

        List<Map<String, Object>> results;

        // --- SỬA ĐỔI: LOGIC IF/ELSE ---
        if (startDate != null && endDate != null) {
            results = reviewRepository.getMenuItemReviewStatsByDateRange(startDate, endDate);
        } else {
            results = reviewRepository.getMenuItemReviewStats();
        }
        // --- KẾT THÚC SỬA ĐỔI ---

        // (Dùng chữ thường "menuitemid", "averagerating", "reviewcount" để fix lỗi 500)
        return results.stream().map(row -> new MenuItemReviewStatsDTO(
                ((Number) row.get("menuitemid")).longValue(),
                (row.get("averagerating") != null) ? ((Number) row.get("averagerating")).doubleValue() : 0.0,
                (row.get("reviewcount") != null) ? ((Number) row.get("reviewcount")).longValue() : 0L
        )).collect(Collectors.toMap(MenuItemReviewStatsDTO::getMenuItemId, dto -> dto));
    }

    // --- SỬA LỖI THỨ TỰ THAM SỐ TẠI ĐÂY ---
    private AdminReviewDTO convertReviewToDTO(Review review) {
        Customer customer = review.getCustomer();
        MenuItem menuItem = review.getMenuItem();
        Order order = review.getOrder();

        return new AdminReviewDTO(
                review.getId(),                     // 1. Long id
                menuItem != null ? menuItem.getName() : "[Món đã xóa]", // 2. String menuItemName
                menuItem != null ? menuItem.getId() : null, // 3. Long menuItemId
                review.getRating(),                 // 4. int rating
                review.getComment(),                // 5. String comment
                review.getReviewTime(),             // 6. LocalDateTime reviewTime  <-- ĐÃ SỬA VỊ TRÍ
                order != null ? order.getId() : null, // 7. Long orderId          <-- ĐÃ SỬA VỊ TRÍ
                customer != null ? customer.getId() : null, // 8. Long customerId
                customer != null ? customer.getPhoneNumber() : "[Khách đã xóa]" // 9. String customerPhone
        );
    }
    // --- KẾT THÚC SỬA LỖI ---
}