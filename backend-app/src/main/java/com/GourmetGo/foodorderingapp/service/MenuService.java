package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

// --- BẮT ĐẦU: THÊM IMPORT MỚI ---
// Thêm 2 import này để sử dụng DTO và Stream API
import com.GourmetGo.foodorderingapp.dto.MenuItemDTO;
import java.util.stream.Collectors;
// --- KẾT THÚC: THÊM IMPORT MỚI ---

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * Lấy danh sách món ăn, hỗ trợ lọc theo món chay và món cay.
     * Kết quả được cache trong "menuCache".
     */

    // --- SỬA ĐỔI 1: Thay đổi kiểu trả về của phương thức ---
    // Từ: public List<MenuItem> getMenuItems(...)
    // Thành: public List<MenuItemDTO> getMenuItems(...)
   // @Cacheable("menuCache")
    public List<MenuItemDTO> getMenuItems(Boolean isVegetarian, Boolean isSpicy) {
        // In ra log để kiểm tra cache (sẽ chỉ chạy lần đầu)
        System.out.println("Đang thực hiện query CSDL để lấy menu...");

        // --- SỬA ĐỔI 2: Tạo biến tạm thời để lưu danh sách Entity ---
        List<MenuItem> menuItems; // Biến này sẽ giữ kết quả từ CSDL

        // Logic lọc của bạn (giữ nguyên)
        if (isVegetarian != null && isSpicy != null) {
            menuItems = menuItemRepository.findByIsVegetarianAndIsSpicy(isVegetarian, isSpicy);
        } else if (isVegetarian != null) {
            menuItems = menuItemRepository.findByIsVegetarian(isVegetarian);
        } else if (isSpicy != null) {
            menuItems = menuItemRepository.findByIsSpicy(isSpicy);
        } else {
            // Không có filter, trả về tất cả
            menuItems = menuItemRepository.findAll();
        }

        // --- SỬA ĐỔI 3: Chuyển đổi List<MenuItem> thành List<MenuItemDTO> ---
        // Chúng ta duyệt qua danh sách menuItems, gọi convertToDTO cho từng món
        // và thu thập kết quả vào một danh sách DTO mới để trả về.
        return menuItems.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // --- BẮT ĐẦU: THÊM PHƯƠNG THỨC TRỢ GIÚP MỚI ---
    // Thêm phương thức private này vào bên trong lớp MenuService
    // Nó chịu trách nhiệm chuyển đổi 1 MenuItem (Entity) sang 1 MenuItemDTO
    private MenuItemDTO convertToDTO(MenuItem menuItem) {
        return new MenuItemDTO(
                menuItem.getId(),
                menuItem.getName(),
                menuItem.getDescription(),
                menuItem.getPrice(),
                menuItem.isVegetarian(),
                menuItem.isSpicy(),
                menuItem.isPopular()
        );
    }
    // --- KẾT THÚC: THÊM PHƯƠNG THỨC TRỢ GIÚP MỚI ---
}