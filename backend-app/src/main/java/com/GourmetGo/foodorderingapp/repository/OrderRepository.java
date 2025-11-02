package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    // Ví dụ về một phương thức tìm kiếm tùy chỉnh:
    // Tìm các đơn hàng theo trạng thái
    List<Order> findByStatus(OrderStatus status);

    // Tìm các đơn hàng của một người dùng cụ thể
    List<Order> findByUserId(Long userId);
}