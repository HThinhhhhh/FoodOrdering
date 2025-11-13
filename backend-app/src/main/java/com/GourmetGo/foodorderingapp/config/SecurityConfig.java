package com.GourmetGo.foodorderingapp.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

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

    @Bean
    @Order(1)
    public SecurityFilterChain customerApiFilterChain(
            HttpSecurity http,
            @Qualifier("customerUserDetailsService") UserDetailsService customerUserDetailsService
    ) throws Exception {
        http
                .securityMatcher("/api/auth/customer/**", "/api/orders/**", "/api/reviews/**", "/api/payments/mock", "/api/users/me")
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers(HttpMethod.POST, "/api/auth/customer/register").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/customer/me").hasRole("DINER")
                        .requestMatchers(HttpMethod.POST, "/api/auth/customer/change-password").hasRole("DINER")
                        .requestMatchers("/api/orders/**").hasRole("DINER")
                        .requestMatchers("/api/reviews/**").hasRole("DINER")
                        .requestMatchers(HttpMethod.POST, "/api/payments/mock").hasRole("DINER")
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").hasRole("DINER")
                        .requestMatchers(HttpMethod.POST, "/api/vouchers/apply").hasRole("DINER")
                        .anyRequest().authenticated()
                )
                .userDetailsService(customerUserDetailsService)
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/customer/login")
                        .usernameParameter("phoneNumber")
                        .passwordParameter("password")
                        .successHandler((req, res, auth) -> res.setStatus(200))
                        .failureHandler((req, res, ex) -> res.setStatus(401))
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/customer/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                );
        return http.build();
    }

    @Bean
    @Order(2)
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
                        .requestMatchers(HttpMethod.GET, "/api/settings").permitAll()
                        .requestMatchers("/api/auth/employee/**").permitAll()
                        .requestMatchers("/api/auth/me").permitAll()

                        // --- SỬA ĐỔI PHÂN QUYỀN ---
                        // === KITCHEN ===
                        .requestMatchers("/api/kitchen/active-orders").hasAnyRole("KITCHEN", "ADMIN")
                        .requestMatchers("/api/kitchen/order/{id}/kitchen-note").hasAnyRole("KITCHEN", "ADMIN")
                        .requestMatchers("/api/kitchen/cancel-order").hasAnyRole("KITCHEN", "ADMIN", "EMPLOYEE")

                        // === ADMIN (QUY TẮC CỤ THỂ TRƯỚC) ===
                        .requestMatchers("/api/admin/menu/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/revenue/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/vouchers/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/reviews/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/options/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/dashboard/**").hasRole("ADMIN")

                        // === EMPLOYEE & ADMIN (QUY TẮC CHUNG SAU) ===
                        .requestMatchers("/api/admin/orders/**").hasAnyRole("ADMIN", "EMPLOYEE")
                        // --- KẾT THÚC SỬA ĐỔI ---

                        // === WEBSOCKET ===
                        .requestMatchers("/ws/**").authenticated()

                        .anyRequest().authenticated()
                )
                .userDetailsService(employeeUserDetailsService)
                .formLogin(form -> form
                        .loginProcessingUrl("/api/auth/employee/login")
                        .usernameParameter("username")
                        .passwordParameter("password")
                        .successHandler((req, res, auth) -> res.setStatus(200))
                        .failureHandler((req, res, ex) -> res.setStatus(401))
                )
                .logout(logout -> logout
                        .logoutUrl("/api/auth/employee/logout")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(200))
                );
        return http.build();
    }
}