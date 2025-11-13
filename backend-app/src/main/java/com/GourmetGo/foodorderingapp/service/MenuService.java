package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.MenuItemAdminRequestDTO;
import com.GourmetGo.foodorderingapp.dto.MenuItemDTO;
import com.GourmetGo.foodorderingapp.dto.OptionGroupDTO; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.dto.OptionItemDTO; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.model.OptionGroup; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.model.OptionItem; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- THÊM IMPORT

import java.util.List;
import java.util.stream.Collectors;
@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    /**
     * Dành cho KHÁCH HÀNG: Lấy các món đang bán hoặc tạm hết hàng
     */
    @Transactional(readOnly = true) // <-- 1. THÊM @Transactional (Rất quan trọng)
    public List<MenuItemDTO> getMenuItems(Boolean isVegetarian, Boolean isSpicy) {
        System.out.println("Đang thực hiện query CSDL để lấy menu (cho khách)...");
        List<MenuItem> menuItems;

        // (Logic lọc giữ nguyên)
        if (isVegetarian != null && isSpicy != null) {
            menuItems = menuItemRepository.findByIsVegetarianAndIsSpicy(isVegetarian, isSpicy);
        } else if (isVegetarian != null) {
            menuItems = menuItemRepository.findByIsVegetarian(isVegetarian);
        } else if (isSpicy != null) {
            menuItems = menuItemRepository.findByIsSpicy(isSpicy);
        } else {
            menuItems = menuItemRepository.findAll();
        }

        return menuItems.stream()
                .filter(item -> item.getStatus() != MenuItemStatus.DISCONTINUED)
                .map(this::convertToDTO) // <-- 2. Gọi hàm DTO đã cập nhật
                .collect(Collectors.toList());
    }

    /**
     * Dành cho ADMIN: Lấy TẤT CẢ các món (kể cả món đã ngừng bán)
     */
    @Transactional(readOnly = true) // <-- THÊM @Transactional
    public List<MenuItem> getAllMenuItemsForAdmin() {
        System.out.println("Đang thực hiện query CSDL để lấy menu (cho admin)...");
        return menuItemRepository.findAll();
    }

    // --- SỬA CÁC HÀM CRUD CHO ADMIN ---

    @Transactional // Thêm Transactional
    public MenuItem createMenuItem(MenuItemAdminRequestDTO dto) {
        MenuItem newItem = new MenuItem();
        // Chuyển dữ liệu từ DTO sang Entity
        newItem.setName(dto.getName());
        newItem.setDescription(dto.getDescription());
        newItem.setPrice(dto.getPrice());
        newItem.setImageUrl(dto.getImageUrl());
        newItem.setCategory(dto.getCategory());
        newItem.setStatus(dto.getStatus());
        newItem.setVegetarian(dto.isVegetarian());
        newItem.setSpicy(dto.isSpicy());
        newItem.setPopular(dto.isPopular());

        return menuItemRepository.save(newItem);
    }

    @Transactional // Thêm Transactional
    public MenuItem updateMenuItem(Long id, MenuItemAdminRequestDTO dto) {
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn ID: " + id));

        // Cập nhật các trường từ DTO
        existingItem.setName(dto.getName());
        existingItem.setDescription(dto.getDescription());
        existingItem.setPrice(dto.getPrice());
        existingItem.setImageUrl(dto.getImageUrl());
        existingItem.setCategory(dto.getCategory());
        existingItem.setStatus(dto.getStatus());
        existingItem.setVegetarian(dto.isVegetarian());
        existingItem.setSpicy(dto.isSpicy());
        existingItem.setPopular(dto.isPopular());

        return menuItemRepository.save(existingItem);
    }

    // --- SỬA ĐỔI TẠI ĐÂY (LOGIC XÓA) ---
    @Transactional // Thêm Transactional
    public void deleteMenuItem(Long id) {
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn ID: " + id));

        // LOGIC MỚI: Không xóa (delete), mà chuyển trạng thái (Soft Delete)
        // Điều này ngăn ngừa lỗi Khóa Ngoại (Foreign Key)
        // Đây chính là logic bạn yêu cầu: "không cho xoá nữa"
        existingItem.setStatus(MenuItemStatus.DISCONTINUED);
        menuItemRepository.save(existingItem);

        // (Xóa dòng cũ: menuItemRepository.deleteById(id);)
    }
    // --- KẾT THÚC SỬA ĐỔI ---


    /**
     * Chuyển đổi MenuItem (Entity) sang MenuItemDTO
     */
    // --- 3. SỬA ĐỔI HÀM CONVERT CHÍNH ---
    private MenuItemDTO convertToDTO(MenuItem menuItem) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(menuItem.getId());
        dto.setName(menuItem.getName());
        dto.setDescription(menuItem.getDescription());
        dto.setPrice(menuItem.getPrice());
        dto.setVegetarian(menuItem.isVegetarian());
        dto.setSpicy(menuItem.isSpicy());
        dto.setPopular(menuItem.isPopular());
        dto.setImageUrl(menuItem.getImageUrl());
        dto.setCategory(menuItem.getCategory());
        dto.setStatus(menuItem.getStatus());

        // --- LOGIC MỚI: Chuyển đổi OptionGroups và OptionItems ---
        // @Transactional là bắt buộc để truy cập 'menuItem.getOptionGroups()' (LAZY load)
        if (menuItem.getOptionGroups() != null) {
            List<OptionGroupDTO> groupDTOs = menuItem.getOptionGroups().stream()
                    .map(this::convertGroupToDTO) // Gọi hàm phụ
                    .collect(Collectors.toList());
            dto.setOptionGroups(groupDTOs);
        }
        // --- KẾT THÚC LOGIC MỚI ---

        return dto;
    }

    // --- 4. THÊM 2 HÀM CONVERT PHỤ ---
    private OptionGroupDTO convertGroupToDTO(OptionGroup group) {
        OptionGroupDTO dto = new OptionGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());

        if (group.getOptions() != null) {
            List<OptionItemDTO> itemDTOs = group.getOptions().stream()
                    .map(this::convertItemToDTO) // Gọi hàm phụ
                    .collect(Collectors.toList());
            dto.setOptions(itemDTOs);
        }
        return dto;
    }

    private OptionItemDTO convertItemToDTO(OptionItem item) {
        OptionItemDTO dto = new OptionItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setPrice(item.getPrice());
        return dto;
    }
    // --- KẾT THÚC THÊM HÀM MỚI ---
}