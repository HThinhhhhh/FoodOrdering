package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class DashboardStatsDTO {
    private BigDecimal totalRevenue; // Tổng doanh thu (chỉ tính đơn COMPLETED)
    private Long totalCompletedOrders; // Tổng số đơn đã hoàn thành
    private Long totalPendingOrders; // Số đơn đang chờ xử lý (Pending + Received + Preparing)
    private Long totalCustomers; // Tổng số khách hàng
}