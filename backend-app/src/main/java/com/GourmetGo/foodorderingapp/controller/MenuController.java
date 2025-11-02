package com.GourmetGo.foodorderingapp.controller;

// --- BẮT ĐẦU: THAY ĐỔI IMPORT ---
// 1. (QUAN TRỌNG) Xóa import model cũ
// import com.GourmetGo.foodorderingapp.model.MenuItem;
// 2. Thêm import DTO mới
import com.GourmetGo.foodorderingapp.dto.MenuItemDTO;
// --- KẾT THÚC: THAY ĐỔI IMPORT ---

import com.GourmetGo.foodorderingapp.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/menu")
public class MenuController {

    @Autowired
    private MenuService menuService;

    // --- SỬA ĐỔI 1: Thay đổi kiểu trả về của phương thức ---
    // Từ: public List<MenuItem> getMenu(...)
    // Thành:
    @GetMapping
    public List<MenuItemDTO> getMenu(
            // @RequestParam(required = false) cho phép người dùng không cần truyền param
            // Spring sẽ tự động map 'is_vegetarian' (snake_case) với 'isVegetarian' (camelCase)
            @RequestParam(required = false, name = "is_vegetarian") Boolean isVegetarian,
            @RequestParam(required = false, name = "is_spicy") Boolean isSpicy
    ) {
        // Dòng này giữ nguyên, nhưng bây giờ nó sẽ trả về List<MenuItemDTO>
        // vì chúng ta đã sửa MenuService ở bước trước.
        return menuService.getMenuItems(isVegetarian, isSpicy);
    }
}