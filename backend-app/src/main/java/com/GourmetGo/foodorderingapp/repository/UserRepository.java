package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // --- THAY ĐỔI TÊN PHƯƠNG THỨC ---
    Optional<User> findByPhoneNumber(String phoneNumber);
}