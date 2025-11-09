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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import static org.springframework.security.config.Customizer.withDefaults;

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
        // --- THAY ĐỔI: TÌM BẰNG SỐ ĐIỆN THOẠI ---
        return phoneNumber -> userRepository.findByPhoneNumber(phoneNumber)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + phoneNumber));
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3001"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // === PUBLIC ===
                        .requestMatchers(HttpMethod.GET, "/api/menu").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // === DINER (KHÁCH HÀNG) ===
                        .requestMatchers("/api/orders/**").hasRole("DINER")

                        // --- SỬA ĐỔI DÒNG NÀY ---
                        // .requestMatchers("/api/reviews").hasRole("DINER") // (Dòng cũ)
                        .requestMatchers("/api/reviews/**").hasRole("DINER") // (Dòng mới: cho phép /api/reviews/order)
                        // --- KẾT THÚC SỬA ĐỔI ---

                        .requestMatchers(HttpMethod.POST, "/api/payments/mock").hasRole("DINER")
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").hasRole("DINER")

                        // === KITCHEN (BẾP) ===
                        .requestMatchers("/api/kitchen/**").hasRole("KITCHEN")
                        .requestMatchers(HttpMethod.POST, "/api/kitchen/cancel-order").hasRole("KITCHEN")

                        // === WEBSOCKET ===
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