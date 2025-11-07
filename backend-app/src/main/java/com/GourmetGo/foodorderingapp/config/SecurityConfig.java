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
// --- THÊM IMPORT NÀY ---
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
// --- KẾT THÚC IMPORT ---
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserRepository userRepository;

    // --- THAY ĐỔI QUAN TRỌNG NHẤT ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Không mã hóa. So sánh mật khẩu 1:1
        return NoOpPasswordEncoder.getInstance();
    }
    // --- KẾT THÚC THAY ĐỔI ---

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + username));
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // Public
                        .requestMatchers(HttpMethod.GET, "/api/menu").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Diner
                        .requestMatchers("/api/orders/**").hasRole("DINER")
                        .requestMatchers("/api/reviews").hasRole("DINER")
                        .requestMatchers(HttpMethod.POST, "/api/payments/mock").hasRole("DINER")

                        // Kitchen
                        .requestMatchers("/api/kitchen/**").hasRole("KITCHEN")

                        // WebSocket
                        .requestMatchers("/ws/**").authenticated()

                        .anyRequest().authenticated()
                )
                // Chúng ta không dùng .formLogin()
                .logout(logout -> logout
                        .logoutUrl("/api/auth/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                        .permitAll()
                );

        return http.build();
    }
}