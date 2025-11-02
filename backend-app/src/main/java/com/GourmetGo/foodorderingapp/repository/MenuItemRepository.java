package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    // Spring Data JPA sẽ tự động tạo các câu lệnh query dựa trên tên phương thức

    /** Tìm các món theo tiêu chí chay */
    List<MenuItem> findByIsVegetarian(boolean isVegetarian);

    /** Tìm các món theo tiêu chí cay */
    List<MenuItem> findByIsSpicy(boolean isSpicy);

    /** Tìm các món theo cả hai tiêu chí */
    List<MenuItem> findByIsVegetarianAndIsSpicy(boolean isVegetarian, boolean isSpicy);
}