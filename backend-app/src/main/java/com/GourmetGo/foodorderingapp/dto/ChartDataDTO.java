package com.GourmetGo.foodorderingapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChartDataDTO {
    private String label; // Tên (ví dụ: "Phở Bò Tái" hoặc "COMPLETED")
    private Long count;   // Số lượng (ví dụ: 150)
}