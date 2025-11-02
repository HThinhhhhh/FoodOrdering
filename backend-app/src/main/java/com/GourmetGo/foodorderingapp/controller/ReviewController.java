package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.ReviewRequest;
import com.GourmetGo.foodorderingapp.model.Review;
import com.GourmetGo.foodorderingapp.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED) // Trả về mã 201 Created
    public Review postReview(@RequestBody ReviewRequest reviewRequest) {
        return reviewService.createReview(reviewRequest);
    }
}