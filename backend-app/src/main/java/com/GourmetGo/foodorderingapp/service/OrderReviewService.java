package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.ItemReviewRequest;
import com.GourmetGo.foodorderingapp.dto.OrderReviewRequest;
import com.GourmetGo.foodorderingapp.model.*;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import com.GourmetGo.foodorderingapp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class OrderReviewService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Transactional
    public void submitOrderReview(OrderReviewRequest request, Customer customer) { // <-- Sửa: User -> Customer
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + request.getOrderId()));

        // --- Kiểm tra các ràng buộc ---

        // 1. Kiểm tra chính chủ
        if (!order.getCustomer().getId().equals(customer.getId())) { // <-- Sửa: .getUser() -> .getCustomer()
            throw new SecurityException("Bạn không có quyền đánh giá đơn hàng này.");
        }

        // 2. Kiểm tra đã hoàn thành (COMPLETED)
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Bạn chỉ có thể đánh giá các đơn hàng đã hoàn thành.");
        }

        // 3. (Goal 4) Kiểm tra đã đánh giá chưa
        if (order.isReviewed()) {
            throw new IllegalStateException("Đơn hàng này đã được đánh giá.");
        }

        // 4. (Goal 5) Kiểm tra trong vòng 3 ngày
        long daysSinceOrder = Duration.between(order.getOrderTime(), LocalDateTime.now()).toDays();
        if (daysSinceOrder > 3) {
            throw new IllegalStateException("Đã quá 3 ngày, không thể đánh giá đơn hàng này.");
        }

        // --- Lưu đánh giá ---

        // 1. Lưu đánh giá Giao hàng
        order.setDeliveryRating(request.getDeliveryRating());
        order.setDeliveryComment(request.getDeliveryComment());
        order.setReviewed(true); // (Goal 4)
        orderRepository.save(order);

        // 2. Lưu đánh giá Món ăn
        for (ItemReviewRequest itemReview : request.getItemReviews()) {
            MenuItem menuItem = menuItemRepository.findById(itemReview.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn ID: " + itemReview.getMenuItemId()));

            Review review = new Review();
            review.setCustomer(customer); // <-- Sửa: .setUser() -> .setCustomer()
            review.setOrder(order);
            review.setMenuItem(menuItem);
            review.setRating(itemReview.getRating());
            review.setComment(itemReview.getComment());

            reviewRepository.save(review);
        }
    }
}