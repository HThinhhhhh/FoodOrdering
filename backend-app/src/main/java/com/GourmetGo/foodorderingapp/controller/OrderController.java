package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.User;
import com.GourmetGo.foodorderingapp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.GourmetGo.foodorderingapp.model.OrderStatus;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<String> createOrder(
            @RequestBody OrderRequest orderRequest,
            @AuthenticationPrincipal User user
    ) {
        // --- SỬA LOGIC KIỂM TRA (Từ 1 lên 3) ---
        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        );

        // 1. Đổi từ 'existsBy...' sang 'countBy...'
        int activeOrderCount = orderRepository.countByUserIdAndStatusIn(user.getId(), activeStatuses);

        // 2. Kiểm tra nếu >= 3
        if (activeOrderCount >= 3) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Bạn đã đạt giới hạn 3 đơn hàng đang hoạt động. Vui lòng hoàn thành các đơn hàng cũ trước khi đặt đơn mới.");
        }
        // --- KẾT THÚC SỬA ---

        try {
            orderRequest.setUserId(user.getId());
            orderService.submitOrder(orderRequest);

            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body("Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể xử lý đơn hàng: " + e.getMessage());
        }
    }

    // (getMyOrders() giữ nguyên)
    @GetMapping("/my-orders")
    public ResponseEntity<List<Map<String, Object>>> getMyOrders(
            @AuthenticationPrincipal User user
    ) {
        try {
            List<Map<String, Object>> userOrders = orderService.getOrdersForUser(user.getId());
            return ResponseEntity.ok(userOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}