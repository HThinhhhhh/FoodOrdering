package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // (Giữ nguyên các phương thức cũ)
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByUserId(Long userId);
    List<Order> findByStatusNot(OrderStatus status); // (Phương thức này bạn đã thêm ở bước KDS)

    // --- THÊM PHƯƠG THỨC NÀY ---
    /** Tìm các đơn hàng của một người dùng, sắp xếp theo thời gian đặt hàng mới nhất */
    List<Order> findByUserIdOrderByOrderTimeDesc(Long userId);
}