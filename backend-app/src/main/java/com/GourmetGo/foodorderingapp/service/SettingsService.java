package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.RestaurantSettingsDTO;
import com.GourmetGo.foodorderingapp.model.RestaurantSettings;
import com.GourmetGo.foodorderingapp.repository.RestaurantSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    @Autowired
    private RestaurantSettingsRepository settingsRepository;

    // ID mặc định cho hàng cài đặt duy nhất
    private static final Long SETTINGS_ID = 1L;

    /**
     * Lấy thông tin cài đặt.
     * Nếu chưa có, trả về một đối tượng rỗng.
     */
    @Transactional(readOnly = true)
    public RestaurantSettings getSettings() {
        return settingsRepository.findById(SETTINGS_ID)
                .orElse(new RestaurantSettings()); // Trả về rỗng (nhưng ID=1) nếu chưa tồn tại
    }

    /**
     * Cập nhật (hoặc Tạo mới nếu chưa có) thông tin cài đặt.
     */
    @Transactional
    public RestaurantSettings updateSettings(RestaurantSettingsDTO dto) {
        // Lấy cài đặt hiện tại hoặc tạo mới nếu chưa có
        RestaurantSettings settings = settingsRepository.findById(SETTINGS_ID)
                .orElse(new RestaurantSettings());

        // Cập nhật tất cả các trường
        settings.setRestaurantName(dto.getRestaurantName());
        settings.setCoverImageUrl(dto.getCoverImageUrl());
        settings.setAddress(dto.getAddress());
        settings.setOpeningHours(dto.getOpeningHours());
        settings.setContactPhone(dto.getContactPhone());
        settings.setContactEmail(dto.getContactEmail());

        // Lưu lại (JPA sẽ tự biết là update hay insert)
        return settingsRepository.save(settings);
    }
}