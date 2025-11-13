package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class OptionGroupDTO {
    private Long id;
    private String name; // Tên nhóm (Vd: "Chọn Size")
    private List<OptionItemDTO> options;
}