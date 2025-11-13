package com.GourmetGo.foodorderingapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminReviewDTO {
    // 1. Long
    private Long id;

    // 2. String
    private String menuItemName;

    // 3. Long
    private Long menuItemId;

    // 4. int
    private int rating;

    // 5. String
    private String comment;

    // 6. LocalDateTime <-- (Đây là thứ tự đúng)
    private LocalDateTime reviewTime;

    // 7. Long
    private Long orderId;

    // 8. Long
    private Long customerId;

    // 9. String
    private String customerPhone;
}