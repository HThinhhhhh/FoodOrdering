package com.GourmetGo.foodorderingapp.repository;

import com.GourmetGo.foodorderingapp.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    /**
     * Tìm nhân viên bằng username (dùng cho Spring Security)
     */
    Optional<Employee> findByUsername(String username);
}