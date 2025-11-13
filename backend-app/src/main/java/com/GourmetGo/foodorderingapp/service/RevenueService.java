package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.RevenueByDateDTO;
import com.GourmetGo.foodorderingapp.dto.RevenueByPaymentMethodDTO;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.BigInteger; // (Import này có thể cần thiết)
import java.sql.Date; // <-- SỬA 1: Import java.sql.Date
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RevenueService {

    @Autowired
    private OrderRepository orderRepository;

    /**
     * Lấy báo cáo doanh thu theo ngày
     */
    @Transactional(readOnly = true)
    public List<RevenueByDateDTO> getRevenueByDate(LocalDateTime startDate, LocalDateTime endDate) {
        List<Map<String, Object>> results = orderRepository.getRevenueByDateRange(startDate, endDate);

        return results.stream().map(row -> new RevenueByDateDTO(
                // 1. Đọc "date" (kiểu java.sql.Date)
                ((Date) row.get("date")).toLocalDate(),

                // 2. Đọc "orderCount" (viết hoa, kiểu Number/BigInteger)
                (row.get("orderCount") != null) ? ((Number) row.get("orderCount")).longValue() : 0L,

                // 3. Đọc "totalRevenue" (viết hoa, kiểu BigDecimal)
                row.get("totalRevenue") == null ? BigDecimal.ZERO : (BigDecimal) row.get("totalRevenue")
        )).collect(Collectors.toList());
    }

    /**
     * Lấy báo cáo doanh thu theo phương thức thanh toán
     */
    @Transactional(readOnly = true)
    public List<RevenueByPaymentMethodDTO> getRevenueByPaymentMethod(LocalDateTime startDate, LocalDateTime endDate) {
        List<Map<String, Object>> results = orderRepository.getRevenueByPaymentMethod(startDate, endDate);

        return results.stream().map(row -> new RevenueByPaymentMethodDTO(
                // 1. Đọc "paymentMethod" (viết hoa)
                (String) row.get("paymentMethod"),

                // 2. Đọc "orderCount"
                (row.get("orderCount") != null) ? ((Number) row.get("orderCount")).longValue() : 0L,

                // 3. Đọc "totalRevenue"
                row.get("totalRevenue") == null ? BigDecimal.ZERO : (BigDecimal) row.get("totalRevenue")
        )).collect(Collectors.toList());
    }
}