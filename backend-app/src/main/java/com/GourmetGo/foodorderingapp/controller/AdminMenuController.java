package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.MenuItemAdminRequestDTO; // <-- THÊM IMPORT MỚI
import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu")
public class AdminMenuController {

    @Autowired
    private MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        List<MenuItem> items = menuService.getAllMenuItemsForAdmin();
        return ResponseEntity.ok(items);
    }

    /**
     * Tạo một món ăn mới
     */
    @PostMapping
    // --- SỬA THAM SỐ: MenuItem -> MenuItemAdminRequestDTO ---
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody MenuItemAdminRequestDTO menuItemDTO) {
        MenuItem createdItem = menuService.createMenuItem(menuItemDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
    }

    /**
     * Cập nhật một món ăn
     */
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Long id,
            // --- SỬA THAM SỐ: MenuItem -> MenuItemAdminRequestDTO ---
            @RequestBody MenuItemAdminRequestDTO menuItemDTO) {
        try {
            MenuItem updatedItem = menuService.updateMenuItem(id, menuItemDTO);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            // Lỗi 404 nếu không tìm thấy ID
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * Xóa một món ăn (Thực ra là "Ngừng bán")
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        try {
            // Logic đã được cập nhật trong MenuService (Bước 4)
            menuService.deleteMenuItem(id);
            return ResponseEntity.noContent().build(); // Trả về 204 No Content
        } catch (RuntimeException e) {
            // Chỉ trả về 404 nếu thực sự không tìm thấy món ăn
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}