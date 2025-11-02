package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
// import org.springframework.messaging.simp.SimpMessagingTemplate; // <-- XÓA IMPORT NÀY
import org.springframework.stereotype.Service;

@Service
public class OrderService {

    /** Tên của hàng đợi trong Redis */
    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // --- BẮT ĐẦU SỬA ĐỔI ---
    // Xóa @Autowired và SimpMessagingTemplate
    // @Autowired
    // private SimpMessagingTemplate messagingTemplate;
    // --- KẾT THÚC SỬA ĐỔI ---

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Nhận yêu cầu đơn hàng, chuyển thành JSON và chỉ đẩy vào Redis Queue.
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

            // --- BẮT ĐẦU SỬA ĐỔI ---
            // Xóa 2 dòng gửi WebSocket ở đây.
            // OrderBatchProcessor sẽ đảm nhận việc này.
            // messagingTemplate.convertAndSend("/topic/kitchen", request);
            // System.out.println("Đã gửi thông báo real-time tới /topic/kitchen");
            // --- KẾT THÚC SỬA ĐỔI ---

        } catch (JsonProcessingException e) {
            System.err.println("Lỗi khi serialize đơn hàng: " + e.getMessage());
            throw new RuntimeException("Lỗi xử lý yêu cầu đơn hàng.", e);
        }
    }
}