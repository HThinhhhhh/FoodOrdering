package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime; // <-- THÊM IMPORT NÀY
import java.util.List;
import java.util.Map; // <-- THÊM IMPORT NÀY (Sửa lỗi 500)

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByOrderTimeDesc(Long customerId);

    List<Order> findByStatusNot(OrderStatus status);

    boolean existsByCustomerIdAndStatusIn(Long customerId, List<OrderStatus> statuses);

    int countByCustomerIdAndStatusIn(Long customerId, List<OrderStatus> statuses);

    // --- BẮT ĐẦU: THÊM CÁC HÀM MỚI ---
    List<Order> findAllByOrderByOrderTimeDesc();
    List<Order> findByStatusOrderByOrderTimeDesc(OrderStatus status);
    List<Order> findByStatusInOrderByOrderTimeAsc(List<OrderStatus> statuses);

    /**
     * (BÁO CÁO) Lấy doanh thu theo NGÀY
     */
    @Query(value =
            "SELECT " +
                    "   CAST(order_time AS DATE) as date, " +
                    "   COUNT(id) as orderCount, " +
                    "   SUM(grand_total) as totalRevenue " +
                    "FROM orders " +
                    "WHERE status = 'COMPLETED' " +
                    "   AND order_time >= :startDate AND order_time <= :endDate " +
                    "GROUP BY CAST(order_time AS DATE) " +
                    "ORDER BY date DESC",
            nativeQuery = true)
    List<Map<String, Object>> getRevenueByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * (BÁO CÁO) Lấy doanh thu theo PTTT
     */
    @Query(value =
            "SELECT " +
                    "   payment_method as paymentMethod, " +
                    "   COUNT(id) as orderCount, " +
                    "   SUM(grand_total) as totalRevenue " +
                    "FROM orders " +
                    "WHERE status = 'COMPLETED' " +
                    "   AND order_time >= :startDate AND order_time <= :endDate " +
                    "GROUP BY payment_method " +
                    "ORDER BY totalRevenue DESC",
            nativeQuery = true)
    List<Map<String, Object>> getRevenueByPaymentMethod(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // --- THÊM HÀM MỚI CHO ĐÁNH GIÁ GIAO HÀNG ---
    /**
     * (ADMIN) Lấy các đơn hàng đã được đánh giá giao hàng (deliveryRating != NULL)
     */
    List<Order> findByDeliveryRatingIsNotNullOrderByOrderTimeDesc();
    // --- KẾT THÚC THÊM MỚI ---
}