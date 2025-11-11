package com.GourmetGo.foodorderingapp.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Bean mã hóa mật khẩu (chung)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    /**
     * Cấu hình CORS chung (chung)
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * BỘ LỌC BẢO MẬT 1: Dành cho KHÁCH HÀNG (Customer)
     * Ưu tiên (Order) 1
     * Chỉ áp dụng cho các API của Khách hàng
     */
    @Bean
    @Order(1) // Ưu tiên chạy trước
    public SecurityFilterChain customerApiFilterChain(
            HttpSecurity http,
            @Qualifier("customerUserDetailsService") UserDetailsService customerUserDetailsService
    ) throws Exception {

        http
                // Chỉ áp dụng cho các URL API của Khách hàng
                .securityMatcher("/api/auth/customer/**", "/api/orders/**", "/api/reviews/**", "/api/payments/mock", "/api/users/me")
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/auth/customer/**").permitAll() // Đăng nhập/Đăng ký của Khách
                        .requestMatchers("/api/orders/**").hasRole("DINER")
                        .requestMatchers("/api/reviews/**").hasRole("DINER")
                        .requestMatchers(HttpMethod.POST, "/api/payments/mock").hasRole("DINER")
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").hasRole("DINER")
                        .anyRequest().authenticated()
                )
                .userDetailsService(customerUserDetailsService) // Chỉ dùng dịch vụ tìm Customer

                // Cấu hình formLogin cho Khách (dùng SĐT)
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/customer/login")
                        .usernameParameter("phoneNumber") // Báo cho Spring biết tên trường SĐT
                        .passwordParameter("password")
                        .successHandler((req, res, auth) -> res.setStatus(200)) // 200 OK
                        .failureHandler((req, res, ex) -> res.setStatus(401))   // 401 Lỗi
                )
                // Cấu hình logout cho Khách
                .logout(logout -> logout
                        .logoutUrl("/api/auth/customer/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                );

        return http.build();
    }

    /**
     * BỘ LỌC BẢO MẬT 2: Dành cho NHÂN VIÊN (Employee) & API CÔNG KHAI (Public)
     * Ưu tiên (Order) 2
     * Áp dụng cho TẤT CẢ các API còn lại
     */
    @Bean
    @Order(2) // Chạy sau
    public SecurityFilterChain employeeApiAndPublicFilterChain(
            HttpSecurity http,
            @Qualifier("employeeUserDetailsService") UserDetailsService employeeUserDetailsService
    ) throws Exception {

        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // === PUBLIC ===
                        .requestMatchers(HttpMethod.GET, "/api/menu").permitAll()
                        .requestMatchers("/api/auth/employee/**").permitAll() // Đăng nhập của Bếp/Admin
                        .requestMatchers("/api/auth/me").permitAll() // (API /me chung - Tạm thời)

                        // === KITCHEN ===
                        .requestMatchers("/api/kitchen/**").hasRole("KITCHEN")

                        // === ADMIN ===
                        // (Thêm /api/admin/** khi bạn phát triển)

                        // === WEBSOCKET ===
                        .requestMatchers("/ws/**").authenticated()

                        .anyRequest().authenticated()
                )
                .userDetailsService(employeeUserDetailsService) // Chỉ dùng dịch vụ tìm Employee

                // Cấu hình formLogin cho Bếp (dùng Username)
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/employee/login")
                        .usernameParameter("username")
                        .passwordParameter("password")
                        .successHandler((req, res, auth) -> res.setStatus(200)) // 200 OK
                        .failureHandler((req, res, ex) -> res.setStatus(401))   // 401 Lỗi
                )
                // Cấu hình logout cho Bếp
                .logout(logout -> logout
                        .logoutUrl("/api/auth/employee/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                );

        return http.build();
    }
}