package com.GourmetGo.foodorderingapp.dto;

import lombok.Data;

@Data
public class RestaurantSettingsDTO {
    private String restaurantName;
    private String coverImageUrl;
    private String address;
    private String openingHours;
    private String contactPhone;
    private String contactEmail;
}