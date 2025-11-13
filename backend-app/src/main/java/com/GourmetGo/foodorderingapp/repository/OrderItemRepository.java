package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.dto.ChartDataDTO;
import com.GourmetGo.foodorderingapp.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * (DASHBOARD) Lấy top 10 món bán chạy nhất
     * (Đếm số lượng 'quantity' của mỗi 'menuItem', nhóm lại, sắp xếp giảm dần)
     */
    @Query("SELECT new com.GourmetGo.foodorderingapp.dto.ChartDataDTO(oi.menuItem.name, SUM(oi.quantity)) " +
            "FROM OrderItem oi " +
            "JOIN oi.order o " +
            "WHERE o.status = 'COMPLETED' " + // Chỉ tính các đơn đã hoàn thành
            "GROUP BY oi.menuItem.name " +
            "ORDER BY SUM(oi.quantity) DESC " +
            "LIMIT 10")
    List<ChartDataDTO> findTopSellingItems();
}