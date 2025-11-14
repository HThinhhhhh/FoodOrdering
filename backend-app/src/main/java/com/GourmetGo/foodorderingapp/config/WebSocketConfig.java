package com.GourmetGo.foodorderingapp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
// --- 1. IMPORT LỚP BẢO MẬT CHÍNH ---
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;
// --- 2. IMPORT LỚP REGISTRY (ĐÂY LÀ IMPORT ĐÚNG) ---
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
// (Không cần "implements WebSocketMessageBrokerConfigurer" nữa)

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig extends AbstractSecurityWebSocketMessageBrokerConfigurer { // <-- 3. Sử dụng "extends"

    /**
     * Cấu hình bảo mật cho các tin nhắn STOMP (bảo vệ message).
     * Đây là mấu chốt để @AuthenticationPrincipal hoạt động trong KitchenController.
     */
    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
                // Yêu cầu bất kỳ tin nhắn (message) nào
                // (bao gồm CONNECT, SUBSCRIBE, và MESSAGE đến /app)
                // đều phải được xác thực (authenticated).
                .anyMessage().authenticated();
    }

    /**
     * Tắt CSRF cho WebSocket.
     * (Giống như .csrf(disable) trong HttpSecurity)
     * Đây là điều bắt buộc, nếu không STOMP sẽ trả về lỗi ERROR.
     */
    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }

    /**
     * Cấu hình đường dẫn (kế thừa từ lớp cha).
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Đăng ký endpoint (kế thừa từ lớp cha).
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:3000", "http://localhost:3001")
                .withSockJS();
    }
}