package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.ReviewRequest;
import com.GourmetGo.foodorderingapp.model.Review;
import com.GourmetGo.foodorderingapp.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

// --- BẮT ĐẦU: THÊM IMPORT MỚI ---
import com.GourmetGo.foodorderingapp.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
// --- KẾT THÚC: THÊM IMPORT MỚI ---

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Trả về mã 201 Created
    public Review postReview(
            @RequestBody ReviewRequest reviewRequest,
            @AuthenticationPrincipal User user // 1. LẤY USER ĐÃ ĐĂNG NHẬP
    ) {
        // 2. GÁN USER ID MỘT CÁCH AN TOÀN
        // Bỏ qua bất kỳ userId nào mà client có thể gửi
        reviewRequest.setUserId(user.getId());

        // 3. Gọi service (service không cần thay đổi)
        return reviewService.createReview(reviewRequest);
    }
}