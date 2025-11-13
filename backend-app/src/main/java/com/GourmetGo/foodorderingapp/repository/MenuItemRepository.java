package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByIsVegetarian(boolean isVegetarian);
    List<MenuItem> findByIsSpicy(boolean isSpicy);
    List<MenuItem> findByIsVegetarianAndIsSpicy(boolean isVegetarian, boolean isSpicy);

    // --- BẮT ĐẦU THÊM MỚI (CHO DASHBOARD) ---
    /**
     * Đếm số lượng món ăn theo trạng thái (VD: TEMP_OUT_OF_STOCK)
     */
    Long countByStatus(MenuItemStatus status);
    // --- KẾT THÚC THÊM MỚI ---
}