package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.model.Customer;
import com.GourmetGo.foodorderingapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/customer")
public class CustomerAuthController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // (Đảm bảo bạn dùng NoOpPasswordEncoder)

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Map<String, String> registerRequest) {
        String phoneNumber = registerRequest.get("phoneNumber");
        String password = registerRequest.get("password");

        if (customerRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số điện thoại đã tồn tại");
        }
        Customer customer = new Customer();
        customer.setPhoneNumber(phoneNumber);
        customer.setPassword(password); // (Không mã hóa vì đang dùng NoOp)
        // customer.setPassword(passwordEncoder.encode(password)); // (Dùng dòng này nếu bạn đổi sang BCrypt)

        // (Trường 'name' và 'address' sẽ được cập nhật khi thanh toán lần đầu)
        customerRepository.save(customer);
        return ResponseEntity.status(HttpStatus.CREATED).body("Đăng ký thành công");
    }

    /**
     * API này được AuthContext gọi để kiểm tra phiên đăng nhập của Khách hàng
     */
    @GetMapping("/me")
    public ResponseEntity<Customer> getMe(@AuthenticationPrincipal Customer customer) {
        // Nếu đã đăng nhập với tư cách Customer, Spring Security sẽ tiêm (inject) vào đây
        if (customer != null) {
            return ResponseEntity.ok(customer);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // Lưu ý: API /api/auth/customer/login và /logout
    // được xử lý tự động bởi .formLogin() và .logout() trong SecurityConfig.
    // Chúng ta không cần định nghĩa chúng ở đây.
}