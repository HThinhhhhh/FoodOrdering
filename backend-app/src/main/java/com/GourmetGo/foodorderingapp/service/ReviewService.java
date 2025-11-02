package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.ReviewRequest;
import com.GourmetGo.foodorderingapp.model.MenuItem;
import com.GourmetGo.foodorderingapp.model.Review;
import com.GourmetGo.foodorderingapp.model.User;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.ReviewRepository;
import com.GourmetGo.foodorderingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository; // Cần thiết

    @Autowired
    private MenuItemRepository menuItemRepository; // Cần thiết

    public Review createReview(ReviewRequest request) {
        // 1. Tìm các thực thể liên quan
        // (Trong ứng dụng thực tế, chúng ta nên xử lý lỗi NotFoundException)
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("MenuItem not found"));

        // 2. Tạo đối tượng Review mới
        Review review = new Review();
        review.setUser(user);
        review.setMenuItem(menuItem);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        // 3. Lưu vào CSDL
        return reviewRepository.save(review);
    }
}
