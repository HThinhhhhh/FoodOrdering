package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * Lấy danh sách món ăn, hỗ trợ lọc theo món chay và món cay.
     * Kết quả được cache trong "menuCache".
     */
    @Cacheable("menuCache")
    public List<MenuItem> getMenuItems(Boolean isVegetarian, Boolean isSpicy) {
        // In ra log để kiểm tra cache (sẽ chỉ chạy lần đầu)
        System.out.println("Đang thực hiện query CSDL để lấy menu...");

        // Logic lọc
        if (isVegetarian != null && isSpicy != null) {
            return menuItemRepository.findByIsVegetarianAndIsSpicy(isVegetarian, isSpicy);
        } else if (isVegetarian != null) {
            return menuItemRepository.findByIsVegetarian(isVegetarian);
        } else if (isSpicy != null) {
            return menuItemRepository.findByIsSpicy(isSpicy);
        } else {
            // Không có filter, trả về tất cả
            return menuItemRepository.findAll();
        }
    }
}
