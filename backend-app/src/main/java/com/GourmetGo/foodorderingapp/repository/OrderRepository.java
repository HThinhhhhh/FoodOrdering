package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query; // <-- 1. THÊM IMPORT
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByOrderTimeDesc(Long customerId);

    List<Order> findByStatusNot(OrderStatus status);

    boolean existsByCustomerIdAndStatusIn(Long customerId, List<OrderStatus> statuses);

    int countByCustomerIdAndStatusIn(Long customerId, List<OrderStatus> statuses);
}