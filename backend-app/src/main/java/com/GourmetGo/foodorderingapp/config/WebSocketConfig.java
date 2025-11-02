package com.GourmetGo.foodorderingapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Kích hoạt WebSocket Message Broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 1. Định nghĩa "Simple Broker" (bộ định tuyến tin nhắn)
        // Client sẽ lắng nghe (subscribe) trên các kênh bắt đầu bằng "/topic"
        registry.enableSimpleBroker("/topic");

        // 2. Định nghĩa tiền tố đích của ứng dụng
        // Client sẽ gửi tin nhắn đến các đích bắt đầu bằng "/app"
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 3. Đăng ký endpoint "/ws" cho kết nối WebSocket
        // Đây là URL mà client sẽ kết nối đến
        registry.addEndpoint("/ws")
                // Cho phép tất cả các domain (origin) kết nối
                // (Trong production, bạn nên giới hạn lại, ví dụ: "http://your-frontend-domain.com")
                .setAllowedOrigins("*");
    }
}