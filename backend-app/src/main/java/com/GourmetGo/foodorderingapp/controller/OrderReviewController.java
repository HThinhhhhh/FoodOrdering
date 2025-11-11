package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.OrderReviewRequest;
import com.GourmetGo.foodorderingapp.model.Customer; // <-- 1. Sửa: User -> Customer
import com.GourmetGo.foodorderingapp.service.OrderReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class OrderReviewController {

    @Autowired
    private OrderReviewService orderReviewService;

    @PostMapping("/order")
    public ResponseEntity<String> submitOrderReview(
            @RequestBody OrderReviewRequest request,
            @AuthenticationPrincipal Customer customer) { // <-- 2. Sửa: User -> Customer

        try {
            orderReviewService.submitOrderReview(request, customer);
            return ResponseEntity.status(HttpStatus.CREATED).body("Đánh giá đã được ghi nhận.");
        } catch (IllegalStateException | SecurityException e) {
            // Lỗi nghiệp vụ (đã đánh giá, quá hạn, chưa hoàn thành)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            // Lỗi server khác
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi máy chủ: " + e.getMessage());
        }
    }
}