package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.model.User;
import com.GourmetGo.foodorderingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Cho phép người dùng cập nhật thông tin cá nhân (Tên, Địa chỉ)
     * Được gọi trong lần thanh toán đầu tiên.
     */
    @PutMapping("/me")
    public ResponseEntity<User> updateUserProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> updates) {

        // (Goal 3 & 5)
        user.setName(updates.get("name"));
        user.setApartmentNumber(updates.get("apartmentNumber"));
        user.setStreetAddress(updates.get("streetAddress"));
        user.setWard(updates.get("ward"));
        user.setCity(updates.get("city"));

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }
}