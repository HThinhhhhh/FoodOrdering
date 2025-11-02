package com.GourmetGo.foodorderingapp.config; // Đảm bảo package này đúng

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Dựa trên log của bạn, /topic/kitchen tồn tại
        config.enableSimpleBroker("/topic");

        // Dựa trên code KDS, /app/kitchen/update-status tồn tại
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ---- ĐÂY LÀ SỬA ĐỔI QUAN TRỌNG ----
        // Chúng ta thêm .setAllowedOrigins(...) để sửa lỗi CORS

        registry.addEndpoint("/ws") // Endpoint mà SockJS kết nối
                .setAllowedOrigins("http://localhost:3000") // <-- THÊM DÒNG NÀY
                .withSockJS(); // Bật SockJS
    }
}