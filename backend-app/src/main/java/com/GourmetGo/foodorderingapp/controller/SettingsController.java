package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.RestaurantSettingsDTO;
import com.GourmetGo.foodorderingapp.model.RestaurantSettings;
import com.GourmetGo.foodorderingapp.service.SettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class SettingsController {

    @Autowired
    private SettingsService settingsService;

    /**
     * API Public: Lấy thông tin cài đặt (cho Khách hàng)
     */
    @GetMapping("/api/settings")
    public ResponseEntity<RestaurantSettings> getSettings() {
        return ResponseEntity.ok(settingsService.getSettings());
    }

    /**
     * API Admin: Cập nhật thông tin cài đặt
     */
    @PutMapping("/api/admin/settings")
    public ResponseEntity<RestaurantSettings> updateSettings(@RequestBody RestaurantSettingsDTO dto) {
        return ResponseEntity.ok(settingsService.updateSettings(dto));
    }
}