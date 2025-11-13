package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.ChartDataDTO; // <-- THÊM IMPORT NÀY
import com.GourmetGo.foodorderingapp.dto.DashboardNotificationDTO;
import com.GourmetGo.foodorderingapp.dto.DashboardStatsDTO;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import com.GourmetGo.foodorderingapp.repository.CustomerRepository;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import com.GourmetGo.foodorderingapp.repository.OrderItemRepository; // <-- THÊM IMPORT NÀY
import com.GourmetGo.foodorderingapp.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    // --- THÊM AUTOWIRED NÀY ---
    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    // (Hàm getDashboardStats() và getDashboardNotifications() giữ nguyên)
    // ...
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        // ... (logic giữ nguyên)
        DashboardStatsDTO stats = new DashboardStatsDTO();
        BigDecimal totalRevenue = orderRepository.findTotalRevenueCompleted();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        stats.setTotalCompletedOrders(orderRepository.countByStatus(OrderStatus.COMPLETED));
        List<OrderStatus> pendingStatuses = List.of(
                OrderStatus.PENDING_CONFIRMATION,
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING
        );
        stats.setTotalPendingOrders(orderRepository.countByStatusIn(pendingStatuses));
        stats.setTotalCustomers(customerRepository.count());
        return stats;
    }

    @Transactional(readOnly = true)
    public List<DashboardNotificationDTO> getDashboardNotifications() {
        // ... (logic giữ nguyên)
        List<DashboardNotificationDTO> notifications = new ArrayList<>();
        Long outOfStockCount = menuItemRepository.countByStatus(MenuItemStatus.TEMP_OUT_OF_STOCK);
        if (outOfStockCount > 0) {
            notifications.add(new DashboardNotificationDTO("ITEM", "món đang tạm hết hàng", outOfStockCount));
        }
        Long cancelledCount = orderRepository.countByStatus(OrderStatus.CANCELLED);
        if (cancelledCount > 0) {
            notifications.add(new DashboardNotificationDTO("ORDER", "đơn hàng đã bị hủy", cancelledCount));
        }
        Long newReviewsCount = reviewRepository.countByReviewTimeAfter(LocalDateTime.now().minusDays(1));
        if (newReviewsCount > 0) {
            notifications.add(new DashboardNotificationDTO("REVIEW", "phản hồi mới chưa đọc", newReviewsCount));
        }
        return notifications;
    }
    // --- KẾT THÚC HÀM CŨ ---


    // --- BẮT ĐẦU CÁC HÀM BIỂU ĐỒ MỚI ---

    /**
     * Lấy dữ liệu cho biểu đồ Top 10 Món bán chạy
     */
    @Transactional(readOnly = true)
    public List<ChartDataDTO> getTopSellingItems() {
        return orderItemRepository.findTopSellingItems();
    }

    /**
     * Lấy dữ liệu cho biểu đồ Phân phối Trạng thái Đơn hàng
     */
    @Transactional(readOnly = true)
    public List<ChartDataDTO> getOrderStatusDistribution() {
        return orderRepository.countByStatusGrouped();
    }

    // --- KẾT THÚC CÁC HÀM BIỂU ĐỒ MỚI ---
}