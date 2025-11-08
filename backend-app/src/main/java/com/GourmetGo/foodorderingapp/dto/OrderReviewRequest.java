package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class OrderReviewRequest {
    private Long orderId;
    private int deliveryRating;
    private String deliveryComment;
    private List<ItemReviewRequest> itemReviews;
}