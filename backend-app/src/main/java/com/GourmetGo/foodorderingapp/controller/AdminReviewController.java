package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.AdminReviewDTO;
import com.GourmetGo.foodorderingapp.dto.MenuItemReviewStatsDTO;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.Review;
import com.GourmetGo.foodorderingapp.service.AdminReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat; // <-- THÊM IMPORT
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate; // <-- THÊM IMPORT
import java.time.LocalDateTime; // <-- THÊM IMPORT
import java.time.LocalTime; // <-- THÊM IMPORT
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminReviewController {

    @Autowired
    private AdminReviewService adminReviewService;

    // (Hàm getFoodReviews và getDeliveryReviews giữ nguyên)
    @GetMapping("/food")
    public ResponseEntity<List<AdminReviewDTO>> getFoodReviews() {
        return ResponseEntity.ok(adminReviewService.getAllFoodReviews());
    }
    @GetMapping("/delivery")
    public ResponseEntity<List<Order>> getDeliveryReviews() {
        return ResponseEntity.ok(adminReviewService.getAllDeliveryReviews());
    }

    // --- SỬA ĐỔI API NÀY ---
    @GetMapping("/stats")
    public ResponseEntity<Map<Long, MenuItemReviewStatsDTO>> getReviewStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;

        if (startDate != null && endDate != null) {
            startDateTime = startDate.atStartOfDay();
            endDateTime = endDate.atTime(LocalTime.MAX);
        }

        return ResponseEntity.ok(adminReviewService.getReviewStats(startDateTime, endDateTime));
    }
    // --- KẾT THÚC SỬA ĐỔI ---
}