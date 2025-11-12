package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByOrderTimeDesc(Long customerId);

    List<Order> findByStatusNot(OrderStatus status);

    boolean existsByCustomerIdAndStatusIn(Long customerId, List<OrderStatus> statuses);

    int countByCustomerIdAndStatusIn(Long customerId, List<OrderStatus> statuses);

    // --- CÁC HÀM MỚI CHO ADMIN/BẾP ---

    List<Order> findAllByOrderByOrderTimeDesc();

    List<Order> findByStatusOrderByOrderTimeDesc(OrderStatus status);

    /** (KDS) Lấy các đơn hàng Bếp cần làm (Đã nhận, Đang làm, Sẵn sàng), sắp xếp theo thời gian CŨ NHẤT */
    List<Order> findByStatusInOrderByOrderTimeAsc(List<OrderStatus> statuses);
    // --- KẾT THÚC THÊM HÀM MỚI ---
}