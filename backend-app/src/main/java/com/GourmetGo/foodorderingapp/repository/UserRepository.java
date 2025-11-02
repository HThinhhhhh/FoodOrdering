package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}