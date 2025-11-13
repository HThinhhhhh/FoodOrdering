package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.OptionGroupRequest;
import com.GourmetGo.foodorderingapp.dto.OptionItemRequest;
import com.GourmetGo.foodorderingapp.model.OptionGroup;
import com.GourmetGo.foodorderingapp.model.OptionItem;
import com.GourmetGo.foodorderingapp.service.MenuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/options") // API chung cho options
public class AdminOptionController {

    @Autowired
    private MenuService menuService; // (Tạm thời dùng chung MenuService)

    /**
     * Thêm một NHÓM TÙY CHỌN (Vd: "Chọn Size") vào một Món ăn
     */
    @PostMapping("/menu/{menuItemId}/groups")
    public ResponseEntity<OptionGroup> addOptionGroup(
            @PathVariable Long menuItemId,
            @RequestBody OptionGroupRequest request) { // <-- Request DTO đã được cập nhật
        try {
            // --- SỬA ĐỔI: Truyền thêm selectionType ---
            OptionGroup newGroup = menuService.addOptionGroup(
                    menuItemId,
                    request.getName(),
                    request.getSelectionType()
            );
            // --- KẾT THÚC SỬA ĐỔI ---
            return ResponseEntity.status(HttpStatus.CREATED).body(newGroup);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    // --- BẮT ĐẦU THÊM MỚI ---
    /**
     * Cập nhật tên hoặc quy tắc (selectionType) của một NHÓM
     */
    @PutMapping("/groups/{groupId}")
    public ResponseEntity<OptionGroup> updateOptionGroup(
            @PathVariable Long groupId,
            @RequestBody OptionGroupRequest request) { // DTO này đã có 'name' và 'selectionType'
        try {
            OptionGroup updatedGroup = menuService.updateOptionGroup(groupId, request);
            return ResponseEntity.ok(updatedGroup);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    // --- KẾT THÚC THÊM MỚI ---

    /**
     * Xóa một NHÓM TÙY CHỌN (và các mục con của nó)
     */
    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<Void> deleteOptionGroup(@PathVariable Long groupId) {
        try {
            menuService.deleteOptionGroup(groupId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Thêm một MỤC TÙY CHỌN (Vd: "Size L") vào một Nhóm
     */
    @PostMapping("/groups/{groupId}/items")
    public ResponseEntity<OptionItem> addOptionItem(
            @PathVariable Long groupId,
            @RequestBody OptionItemRequest request) {
        try {
            OptionItem newItem = menuService.addOptionItem(
                    groupId,
                    request.getName(),
                    request.getPrice(),
                    request.getLinkedMenuItemId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(newItem);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    /**
     * Xóa một MỤC TÙY CHỌN
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteOptionItem(@PathVariable Long optionItemId) {
        try {
            menuService.deleteOptionItem(optionItemId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}