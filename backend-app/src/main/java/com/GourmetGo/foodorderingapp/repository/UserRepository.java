package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional; // <-- THÊM IMPORT NÀY

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // --- THÊM PHƯƠNG THỨC NÀY ---
    Optional<User> findByUsername(String username);
}