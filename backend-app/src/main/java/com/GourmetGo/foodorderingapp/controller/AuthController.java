package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.model.Role;
import com.GourmetGo.foodorderingapp.model.User;
import com.GourmetGo.foodorderingapp.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody Map<String, String> loginRequest, HttpServletRequest request) {
        // --- THAY ĐỔI: username -> phoneNumber ---
        String phoneNumber = loginRequest.get("phoneNumber");
        String password = loginRequest.get("password");

        try {
            UsernamePasswordAuthenticationToken token =
                    new UsernamePasswordAuthenticationToken(phoneNumber, password);
            Authentication authentication = authenticationManager.authenticate(token);

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            HttpSession session = request.getSession(true);
            session.setAttribute("SPRING_SECURITY_CONTEXT", context);

            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(@RequestBody Map<String, String> registerRequest) {
        // --- THAY ĐỔI: username -> phoneNumber (Goal 1) ---
        String phoneNumber = registerRequest.get("phoneNumber");
        String password = registerRequest.get("password");

        if (userRepository.findByPhoneNumber(phoneNumber).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Số điện thoại đã tồn tại");
        }
        User user = new User();
        user.setPhoneNumber(phoneNumber); // Đặt SĐT
        user.setPassword(password); // (Vì chúng ta đang dùng NoOpPasswordEncoder)
        user.setRole(Role.DINER);
        // 'name' và địa chỉ sẽ là null cho đến khi họ đặt hàng
        userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("Đăng ký thành công");
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal User user) {
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
}