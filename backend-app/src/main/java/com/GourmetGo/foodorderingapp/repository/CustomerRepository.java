package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    /**
     * Tìm khách hàng bằng số điện thoại (dùng cho Spring Security)
     */
    Optional<Customer> findByPhoneNumber(String phoneNumber);
}