package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.Customer;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import com.GourmetGo.foodorderingapp.service.OrderService;
import com.GourmetGo.foodorderingapp.dto.ReOrderItemDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
            @AuthenticationPrincipal Customer customer // <-- 2. Sửa: User -> Customer
    ) {
        // --- SỬA LOGIC KIỂM TRA (Dùng Customer) ---
        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        );

        // 3. Sửa: user.getId() -> customer.getId()
        int activeOrderCount = orderRepository.countByCustomerIdAndStatusIn(customer.getId(), activeStatuses);

        if (activeOrderCount >= 3) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Bạn đã đạt giới hạn 3 đơn hàng đang hoạt động. Vui lòng hoàn thành các đơn hàng cũ trước khi đặt đơn mới.");
        }
        // --- KẾT THÚC SỬA ---

        try {
            orderRequest.setUserId(customer.getId()); // Gán ID của Customer
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
            @AuthenticationPrincipal Customer customer // <-- 4. Sửa: User -> Customer
    ) {
        try {
            // 5. Sửa: user.getId() -> customer.getId()
            List<Map<String, Object>> userOrders = orderService.getOrdersForUser(customer.getId());
            return ResponseEntity.ok(userOrders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{orderId}/reorder")
    public ResponseEntity<List<ReOrderItemDTO>> getReOrderData(
            @PathVariable Long orderId,
            @AuthenticationPrincipal Customer customer
    ) {
        try {
            // Lấy dữ liệu và kiểm tra quyền sở hữu trong service
            List<ReOrderItemDTO> reOrderItems = orderService.getReOrderData(orderId, customer.getId());
            return ResponseEntity.ok(reOrderItems);
        } catch (SecurityException e) {
            // Lỗi nếu cố gắng đặt lại đơn hàng của người khác
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        } catch (RuntimeException e) {
            // Lỗi nếu không tìm thấy đơn hàng
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
}