package com.GourmetGo.foodorderingapp.dto;

import com.GourmetGo.foodorderingapp.model.SelectionType; // <-- THÊM IMPORT
import lombok.Data;

@Data
public class OptionGroupRequest {
    private String name;
    private SelectionType selectionType; // <-- THÊM MỚI
}