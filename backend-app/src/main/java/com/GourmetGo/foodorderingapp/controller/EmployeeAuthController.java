package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.model.Employee;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/employee")
public class EmployeeAuthController {

    /**
     * API này được AuthContext gọi để kiểm tra phiên đăng nhập của Bếp/Admin
     */
    @GetMapping("/me")
    public ResponseEntity<Employee> getMe(@AuthenticationPrincipal Employee employee) {
        // Nếu đã đăng nhập với tư cách Employee, Spring Security sẽ tiêm (inject) vào đây
        if (employee != null) {
            return ResponseEntity.ok(employee);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // Lưu ý: API /api/auth/employee/login và /logout
    // được xử lý tự động bởi .formLogin() và .logout() trong SecurityConfig.
}