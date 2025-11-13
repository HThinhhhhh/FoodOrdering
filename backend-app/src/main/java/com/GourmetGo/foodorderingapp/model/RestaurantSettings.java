package com.GourmetGo.foodorderingapp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "restaurant_settings")
@Getter
@Setter
@NoArgsConstructor
public class RestaurantSettings {

    @Id
    private Long id = 1L; // Chúng ta chỉ dùng 1 hàng duy nhất, luôn là ID=1

    private String restaurantName;

    @Column(length = 1024)
    private String coverImageUrl;

    private String address;

    private String openingHours;

    private String contactPhone;

    private String contactEmail;
}