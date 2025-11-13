package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.AdminReviewDTO; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.dto.MenuItemReviewStatsDTO;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.Review;
import com.GourmetGo.foodorderingapp.service.AdminReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    @Autowired
    private AdminReviewService adminReviewService;

    @GetMapping("/food")
    public ResponseEntity<List<AdminReviewDTO>> getFoodReviews() { // <-- SỬA KIỂU TRẢ VỀ
        return ResponseEntity.ok(adminReviewService.getAllFoodReviews());
    }

    @GetMapping("/delivery")
    public ResponseEntity<List<Order>> getDeliveryReviews() {
        return ResponseEntity.ok(adminReviewService.getAllDeliveryReviews());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<Long, MenuItemReviewStatsDTO>> getReviewStats() {
        return ResponseEntity.ok(adminReviewService.getReviewStats());
    }
}