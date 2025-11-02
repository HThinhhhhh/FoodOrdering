package com.GourmetGo.foodorderingapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Autowired
    private RateLimitingInterceptor rateLimitingInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Áp dụng RateLimitingInterceptor CHỈ cho endpoint POST /api/orders
        registry.addInterceptor(rateLimitingInterceptor)
                .addPathPatterns("/api/orders");
        // Có thể thêm .addPathPatterns("/api/reviews") nếu bạn muốn
    }
}