package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<String> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            orderService.submitOrder(orderRequest);

            // Trả về 202 ACCEPTED: "Yêu cầu đã được chấp nhận để xử lý"
            // (chứ không phải 201 CREATED, vì nó chưa được tạo)
            return ResponseEntity.status(HttpStatus.ACCEPTED)
                    .body("Đơn hàng của bạn đã được tiếp nhận và đang chờ xử lý.");
        } catch (Exception e) {
            // Nếu có lỗi (ví dụ: lỗi serialize), trả về lỗi server
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể xử lý đơn hàng: " + e.getMessage());
        }
    }
}
