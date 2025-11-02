package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate; // 1. Import
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    /** Tên của hàng đợi trong Redis */
    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // 2. Tiêm (Inject) Messaging Template
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Nhận yêu cầu đơn hàng, chuyển thành JSON, đẩy vào Redis Queue
     * VÀ gửi thông báo WebSocket cho nhà bếp.
     *
     * @param request Yêu cầu đơn hàng từ client
     */
    public void submitOrder(OrderRequest request) {
        try {
            // 1. Serialize
            String orderJsonString = objectMapper.writeValueAsString(request);

            // 2. Đẩy vào Redis Queue
            redisTemplate.opsForList().leftPush(ORDER_QUEUE_KEY, orderJsonString);

            System.out.println("Đã đẩy đơn hàng vào queue: " + orderJsonString);

            // 3. (MỚI) Gửi thông báo real-time tới kênh "/topic/kitchen"
            // Bất kỳ client nào (ví dụ: màn hình bếp KDS) đang lắng nghe
            // kênh này sẽ nhận được đối tượng 'request' (đã tự động
            // được Spring serialize thành JSON).
            messagingTemplate.convertAndSend("/topic/kitchen", request);

            System.out.println("Đã gửi thông báo real-time tới /topic/kitchen");

        } catch (JsonProcessingException e) {
            System.err.println("Lỗi khi serialize đơn hàng: " + e.getMessage());
            throw new RuntimeException("Lỗi xử lý yêu cầu đơn hàng.", e);
        }
    }
}