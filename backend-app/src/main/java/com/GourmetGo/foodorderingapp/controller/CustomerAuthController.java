package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.ChangePasswordRequest; // <-- THÊM IMPORT MỚI
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
    private PasswordEncoder passwordEncoder; // Đã tiêm BCrypt từ SecurityConfig

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Map<String, String> registerRequest) {
        String phoneNumber = registerRequest.get("phoneNumber");
        String password = registerRequest.get("password");

        if (customerRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số điện thoại đã tồn tại");
        }
        Customer customer = new Customer();
        customer.setPhoneNumber(phoneNumber);

        // Giữ nguyên logic băm mật khẩu khi đăng ký
        customer.setPassword(passwordEncoder.encode(password));

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
        // (Nếu SecurityConfig được thiết lập đúng, /me sẽ không bao giờ nhận customer là null
        // vì nó đã được bảo vệ, nhưng giữ lại để rõ ràng)
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    // --- BẮT ĐẦU THÊM PHƯƠNG THỨC MỚI ---
    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal Customer customer,
            @RequestBody ChangePasswordRequest request) {

        // 1. Kiểm tra mật khẩu hiện tại có khớp không
        if (!passwordEncoder.matches(request.getCurrentPassword(), customer.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không đúng.");
        }

        // 2. Kiểm tra mật khẩu mới (có thể thêm nhiều logic validation hơn)
        if (request.getNewPassword() == null || request.getNewPassword().isBlank() || request.getNewPassword().length() < 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu mới không hợp lệ (yêu cầu ít nhất 3 ký tự).");
        }

        // 3. Băm và lưu mật khẩu mới
        customer.setPassword(passwordEncoder.encode(request.getNewPassword()));
        customerRepository.save(customer);

        return ResponseEntity.ok("Đổi mật khẩu thành công.");
    }
    // --- KẾT THÚC THÊM PHƯƠNG THỨC MỚI ---


    // Lưu ý: API /api/auth/customer/login và /logout
    // được xử lý tự động bởi .formLogin() và .logout() trong SecurityConfig.
    // Chúng ta không cần định nghĩa chúng ở đây.
}