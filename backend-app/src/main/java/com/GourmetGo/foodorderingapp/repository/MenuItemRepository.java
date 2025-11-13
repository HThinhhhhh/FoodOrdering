package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    /** Tìm các món theo tiêu chí chay (VÀ không bị ngừng bán) */
    List<MenuItem> findByVegetarianAndStatusNot(boolean vegetarian, MenuItemStatus status);

    /** Tìm các món theo tiêu chí cay (VÀ không bị ngừng bán) */
    List<MenuItem> findBySpicyAndStatusNot(boolean spicy, MenuItemStatus status);

    /** Tìm các món theo cả hai tiêu chí (VÀ không bị ngừng bán) */
    List<MenuItem> findByVegetarianAndSpicyAndStatusNot(boolean vegetarian, boolean spicy, MenuItemStatus status);

    /** Lấy tất cả các món không bị ngừng bán */
    List<MenuItem> findByStatusNot(MenuItemStatus status);

    /**
     * Đếm số lượng món ăn theo trạng thái (VD: TEMP_OUT_OF_STOCK)
     */
    Long countByStatus(MenuItemStatus status);

}