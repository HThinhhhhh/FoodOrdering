package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.MenuItemAdminRequestDTO;
import com.GourmetGo.foodorderingapp.dto.MenuItemDTO;
import com.GourmetGo.foodorderingapp.dto.OptionGroupDTO;
import com.GourmetGo.foodorderingapp.dto.OptionItemDTO;
import com.GourmetGo.foodorderingapp.dto.OptionGroupRequest;

import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.model.OptionGroup;
import com.GourmetGo.foodorderingapp.model.OptionItem;
import com.GourmetGo.foodorderingapp.model.MenuItemStatus;
import com.GourmetGo.foodorderingapp.model.SelectionType;

import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.OptionGroupRepository; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.repository.OptionItemRepository; // <-- THÊM IMPORT

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable; // (Bạn có thể bật lại cache nếu muốn)
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // <-- THÊM IMPORT

import java.math.BigDecimal; // <-- THÊM IMPORT
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepository;

    // --- THÊM 2 REPO MỚI (BẮT BUỘC) ---
    @Autowired
    private OptionGroupRepository optionGroupRepository;
    @Autowired
    private OptionItemRepository optionItemRepository;
    // --- KẾT THÚC ---

    /**
     * Dành cho KHÁCH HÀNG: Lấy các món đang bán hoặc tạm hết hàng
     */
    @Transactional(readOnly = true) // Bắt buộc @Transactional để load LAZY
    // @Cacheable("menuCache") // (Tạm thời tắt cache để dễ debug)
    public List<MenuItemDTO> getMenuItems(Boolean isVegetarian, Boolean isSpicy) {
        System.out.println("Đang thực hiện query CSDL để lấy menu (cho khách)...");
        List<MenuItem> menuItems;

        MenuItemStatus excludedStatus = MenuItemStatus.DISCONTINUED;

        if (isVegetarian != null && isSpicy != null) {
            menuItems = menuItemRepository.findByVegetarianAndSpicyAndStatusNot(isVegetarian, isSpicy, excludedStatus);
        } else if (isVegetarian != null) {
            menuItems = menuItemRepository.findByVegetarianAndStatusNot(isVegetarian, excludedStatus);
        } else if (isSpicy != null) {
            menuItems = menuItemRepository.findBySpicyAndStatusNot(isSpicy, excludedStatus);
        } else {
            menuItems = menuItemRepository.findByStatusNot(excludedStatus);
        }

        return menuItems.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Dành cho ADMIN: Lấy TẤT CẢ các món (kể cả món đã ngừng bán)
     */
    @Transactional(readOnly = true)
    public List<MenuItem> getAllMenuItemsForAdmin() {
        System.out.println("Đang thực hiện query CSDL để lấy menu (cho admin)...");
        return menuItemRepository.findAll();
    }

    // --- BẮT ĐẦU: CÁC HÀM CRUD CHO ADMIN ---

    @Transactional
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

    @Transactional
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

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem existingItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy món ăn ID: " + id));

        // Logic "Xóa mềm": Chuyển trạng thái sang Ngừng bán
        existingItem.setStatus(MenuItemStatus.DISCONTINUED);
        menuItemRepository.save(existingItem);
    }
    // --- KẾT THÚC: CÁC HÀM CRUD CHO ADMIN ---


    // --- BẮT ĐẦU: CÁC HÀM CRUD CHO OPTIONS/COMBO ---

    // --- SỬA ĐỔI HÀM NÀY ---
    @Transactional
    public OptionGroup addOptionGroup(Long menuItemId, String groupName, SelectionType selectionType) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy MenuItem ID: " + menuItemId));

        OptionGroup newGroup = new OptionGroup();
        newGroup.setName(groupName);
        newGroup.setMenuItem(menuItem);
        newGroup.setSelectionType(selectionType); // <-- THÊM MỚI

        return optionGroupRepository.save(newGroup);
    }
    // --- KẾT THÚC SỬA ĐỔI ---

    // --- BẮT ĐẦU THÊM PHƯƠNG THỨC MỚI ---
    /**
     * Cập nhật Tên và/hoặc Quy tắc (SelectionType) của một OptionGroup
     */
    @Transactional
    public OptionGroup updateOptionGroup(Long groupId, OptionGroupRequest request) {
        OptionGroup group = optionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy OptionGroup ID: " + groupId));

        // Cập nhật các trường từ DTO
        group.setName(request.getName());
        group.setSelectionType(request.getSelectionType());

        return optionGroupRepository.save(group);
    }
    // --- KẾT THÚC THÊM PHƯƠNG THỨC MỚI ---

    @Transactional
    public void deleteOptionGroup(Long groupId) {
        // (Repository sẽ tự động xóa các OptionItem con nhờ CascadeType.ALL)
        optionGroupRepository.deleteById(groupId);
    }

    @Transactional
    public OptionItem addOptionItem(Long groupId, String name, BigDecimal price, Long linkedMenuItemId) {
        OptionGroup group = optionGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy OptionGroup ID: " + groupId));

        MenuItem linkedItem = null;
        if (linkedMenuItemId != null) {
            linkedItem = menuItemRepository.findById(linkedMenuItemId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy MenuItem (để liên kết) ID: " + linkedMenuItemId));
        }

        OptionItem newItem = new OptionItem();
        newItem.setName(name);
        newItem.setPrice(price);
        newItem.setLinkedMenuItem(linkedItem);
        newItem.setOptionGroup(group);

        return optionItemRepository.save(newItem);
    }

    @Transactional
    public void deleteOptionItem(Long optionItemId) {
        optionItemRepository.deleteById(optionItemId);
    }

    // --- KẾT THÚC: CÁC HÀM CRUD CHO OPTIONS/COMBO ---


    // --- CÁC HÀM CONVERT DTO (ĐÃ CẬP NHẬT) ---

    /**
     * Chuyển đổi MenuItem (Entity) sang MenuItemDTO (Đầy đủ)
     */
    private MenuItemDTO convertToDTO(MenuItem menuItem) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(menuItem.getId());
        dto.setName(menuItem.getName());
        dto.setDescription(menuItem.getDescription());
        dto.setPrice(menuItem.getPrice());
        dto.setVegetarian(menuItem.isVegetarian());
        dto.setSpicy(menuItem.isSpicy());
        dto.setPopular(menuItem.isPopular());

        // Thêm các trường mới
        dto.setImageUrl(menuItem.getImageUrl());
        dto.setCategory(menuItem.getCategory());
        dto.setStatus(menuItem.getStatus());

        // Thêm logic chuyển đổi Tùy chọn (Options/Combo)
        // @Transactional(readOnly = true) ở hàm getMenuItems() là bắt buộc
        if (menuItem.getOptionGroups() != null) {
            List<OptionGroupDTO> groupDTOs = menuItem.getOptionGroups().stream()
                    .map(this::convertGroupToDTO) // Gọi hàm phụ
                    .collect(Collectors.toList());
            dto.setOptionGroups(groupDTOs);
        }

        return dto;
    }

    /**
     * Hàm phụ: Chuyển OptionGroup sang OptionGroupDTO
     */
    // --- SỬA ĐỔI HÀM NÀY ---
    private OptionGroupDTO convertGroupToDTO(OptionGroup group) {
        OptionGroupDTO dto = new OptionGroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setSelectionType(group.getSelectionType()); // <-- THÊM MỚI

        if (group.getOptions() != null) {
            List<OptionItemDTO> itemDTOs = group.getOptions().stream()
                    .map(this::convertItemToDTO)
                    .collect(Collectors.toList());
            dto.setOptions(itemDTOs);
        }
        return dto;
    }

    /**
     * Hàm phụ: Chuyển OptionItem sang OptionItemDTO
     */
    private OptionItemDTO convertItemToDTO(OptionItem item) {
        OptionItemDTO dto = new OptionItemDTO();
        dto.setId(item.getId());
        dto.setName(item.getName());
        dto.setPrice(item.getPrice());

        // Thêm logic liên kết Combo
        if (item.getLinkedMenuItem() != null) {
            dto.setLinkedMenuItemId(item.getLinkedMenuItem().getId());
        }

        return dto;
    }
    // --- KẾT THÚC CÁC HÀM CONVERT ---
}