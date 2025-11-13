package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.RestaurantSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantSettingsRepository extends JpaRepository<RestaurantSettings, Long> {
    // JpaRepository đã cung cấp đủ các hàm findById, save
}