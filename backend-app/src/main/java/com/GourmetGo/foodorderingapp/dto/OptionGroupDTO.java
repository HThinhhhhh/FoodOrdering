package com.GourmetGo.foodorderingapp.dto;

import com.GourmetGo.foodorderingapp.model.SelectionType; // <-- THÊM IMPORT
import lombok.Data;
import java.util.List;

@Data
public class OptionGroupDTO {
    private Long id;
    private String name;
    private List<OptionItemDTO> options;

    // --- THÊM MỚI ---
    private SelectionType selectionType;
    // --- KẾT THÚC THÊM MỚI ---
}