package com.GourmetGo.foodorderingapp.config;

import com.GourmetGo.foodorderingapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// --- BẮT ĐẦU: THÊM IMPORT MỚI ---
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import static org.springframework.security.config.Customizer.withDefaults;
// --- KẾT THÚC: THÊM IMPORT MỚI ---


@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    // --- BEAN MỚI: CẤU HÌNH CORS TOÀN CỤC ---
    // (Tệp của bạn đang thiếu Bean này)
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép cả 2 cổng frontend truy cập
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true); // Cho phép gửi cookie (session)
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho tất cả các đường dẫn
        return source;
    }
    // --- KẾT THÚC BEAN MỚI ---


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // --- THÊM CẤU HÌNH CORS VÀO ĐÂY ---
                // (Tệp của bạn đang thiếu dòng này)
                .cors(withDefaults()) // Kích hoạt CORS bằng Bean ở trên

                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // === PUBLIC ===
                        .requestMatchers(HttpMethod.GET, "/api/menu").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // === DINER (KHÁCH HÀNG) ===
                        .requestMatchers("/api/orders/**").hasRole("DINER")
                        .requestMatchers("/api/reviews").hasRole("DINER")

                        // --- THÊM LẠI DÒNG NÀY ---
                        // (Tệp của bạn đang thiếu dòng này, gây ra lỗi 403)
                        .requestMatchers(HttpMethod.POST, "/api/payments/mock").hasRole("DINER")
                        // --- KẾT THÚC THÊM LẠI ---

                        // === KITCHEN (BẾP) ===
                        .requestMatchers("/api/kitchen/**").hasRole("KITCHEN")

                        // === WEBSOCKET (CHO CẢ HAI VAI TRÒ ĐÃ ĐĂNG NHẬP) ===
                        .requestMatchers("/ws/**").authenticated()

                        .anyRequest().authenticated()
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                        .permitAll()
                );

        return http.build();
    }
}