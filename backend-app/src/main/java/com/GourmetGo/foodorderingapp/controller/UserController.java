package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.model.Customer; // <-- 1. Sửa: User -> Customer
import com.GourmetGo.foodorderingapp.repository.CustomerRepository; // <-- 2. Sửa: UserRepository -> CustomerRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users") // (Giữ nguyên URL /api/users)
public class UserController {

    @Autowired
    private CustomerRepository customerRepository; // <-- 3. Sửa: UserRepository -> CustomerRepository

    /**
     * Cho phép người dùng cập nhật thông tin cá nhân (Tên, Địa chỉ)
     */
    @PutMapping("/me")
    public ResponseEntity<Customer> updateUserProfile( // <-- 4. Sửa: User -> Customer
                                                       @AuthenticationPrincipal Customer customer, // <-- 5. Sửa: User -> Customer
                                                       @RequestBody Map<String, String> updates) {

        customer.setName(updates.get("name"));
        customer.setApartmentNumber(updates.get("apartmentNumber"));
        customer.setStreetAddress(updates.get("streetAddress"));
        customer.setWard(updates.get("ward"));
        customer.setCity(updates.get("city"));

        Customer updatedCustomer = customerRepository.save(customer);
        return ResponseEntity.ok(updatedCustomer);
    }
}