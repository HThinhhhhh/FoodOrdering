package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// --- THÊM CÁC IMPORT NÀY ---
import com.GourmetGo.foodorderingapp.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import java.util.Map;
// --- KẾT THÚC THÊM IMPORT ---

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<String> createOrder(
            @RequestBody OrderRequest orderRequest,
            @AuthenticationPrincipal User user // 3. LẤY USER ĐÃ ĐĂNG NHẬP
    ) {
        try {
            // 4. GÁN USER ID VÀO REQUEST
            // (Không còn tin tưởng ID từ client gửi lên)
            orderRequest.setUserId(user.getId());

            orderService.submitOrder(orderRequest);

            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body("Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể xử lý đơn hàng: " + e.getMessage());
        }
    }

    @GetMapping("/my-orders")
    public ResponseEntity<List<Map<String, Object>>> getMyOrders(
            @AuthenticationPrincipal User user // 5. LẤY USER ĐÃ ĐĂNG NHẬP
    ) {
        try {
            // 6. DÙNG USER ID THẬT
            List<Map<String, Object>> userOrders = orderService.getOrdersForUser(user.getId());
            return ResponseEntity.ok(userOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}