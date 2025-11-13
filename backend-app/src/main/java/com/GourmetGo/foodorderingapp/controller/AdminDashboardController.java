package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.ChartDataDTO; // <-- THÊM IMPORT NÀY
import com.GourmetGo.foodorderingapp.dto.DashboardNotificationDTO;
import com.GourmetGo.foodorderingapp.dto.DashboardStatsDTO;
import com.GourmetGo.foodorderingapp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    @Autowired
    private DashboardService dashboardService;

    // (Hàm getDashboardStats() và getDashboardNotifications() giữ nguyên)
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/notifications")
    public ResponseEntity<List<DashboardNotificationDTO>> getDashboardNotifications() {
        List<DashboardNotificationDTO> notifications = dashboardService.getDashboardNotifications();
        return ResponseEntity.ok(notifications);
    }

    // --- BẮT ĐẦU THÊM API BIỂU ĐỒ MỚI ---

    /**
     * API lấy Top 10 món bán chạy
     */
    @GetMapping("/top-items")
    public ResponseEntity<List<ChartDataDTO>> getTopSellingItems() {
        return ResponseEntity.ok(dashboardService.getTopSellingItems());
    }

    /**
     * API lấy Phân phối trạng thái đơn hàng
     */
    @GetMapping("/order-status-distribution")
    public ResponseEntity<List<ChartDataDTO>> getOrderStatusDistribution() {
        return ResponseEntity.ok(dashboardService.getOrderStatusDistribution());
    }

    // --- KẾT THÚC THÊM API BIỂU ĐỒ MỚI ---
}