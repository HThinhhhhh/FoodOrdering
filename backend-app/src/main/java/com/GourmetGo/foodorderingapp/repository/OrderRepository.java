package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // (Các phương thức cũ giữ nguyên)
    List<Order> findByUserIdOrderByOrderTimeDesc(Long userId);
    List<Order> findByStatusNot(OrderStatus status);

    // (Phương thức này không còn dùng nữa, nhưng có thể giữ lại)
    boolean existsByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);

    // --- THÊM PHƯƠNG THỨC NÀY ---
    /**
     * Đếm số lượng đơn hàng của một người dùng đang ở
     * MỘT TRONG các trạng thái được cung cấp.
     */
    int countByUserIdAndStatusIn(Long userId, List<OrderStatus> statuses);
    // --- KẾT THÚC THÊM ---
}