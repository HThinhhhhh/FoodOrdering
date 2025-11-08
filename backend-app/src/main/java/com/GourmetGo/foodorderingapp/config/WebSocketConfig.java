package com.GourmetGo.foodorderingapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
// (Xóa @Profile("kitchen") nếu còn)
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // --- SỬA DÒNG NÀY ---
        registry.addEndpoint("/ws")
                // Thêm dòng này để cho phép Cổng 3000 và 3001 kết nối
                .setAllowedOrigins("http://localhost:3000", "http://localhost:3001")
                .withSockJS();
        // --- KẾT THÚC SỬA ĐỔI ---
    }
}