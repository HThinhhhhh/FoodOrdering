package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
// --- BẮT ĐẦU: THÊM IMPORT MỚI ---
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Thêm import này

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
// --- KẾT THÚC: THÊM IMPORT MỚI ---

@Service
public class OrderService {

    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    // --- BẮT ĐẦU: THÊM DEPENDENCY MỚI ---
    @Autowired
    private OrderRepository orderRepository; // Cần để đọc đơn hàng
    // --- KẾT THÚC: THÊM DEPENDENCY MỚI ---

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Nhận yêu cầu đơn hàng, chuyển thành JSON và chỉ đẩy vào Redis Queue.
     */
    public void submitOrder(OrderRequest request) {
        try {
            String orderJsonString = objectMapper.writeValueAsString(request);
            redisTemplate.opsForList().leftPush(ORDER_QUEUE_KEY, orderJsonString);
            System.out.println("Đã đẩy đơn hàng vào queue: " + orderJsonString);
        } catch (JsonProcessingException e) {
            System.err.println("Lỗi khi serialize đơn hàng: " + e.getMessage());
            throw new RuntimeException("Lỗi xử lý yêu cầu đơn hàng.", e);
        }
    }

    // --- BẮT ĐẦU: THÊM PHƯƠNG THỨC MỚI ---
    /**
     * Lấy tất cả đơn hàng cho một người dùng (để hiển thị trang "Đơn hàng của tôi").
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrdersForUser(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderTimeDesc(userId);

        // Chuyển đổi sang DTO (Map) để tránh lỗi Lazy Loading
        return orders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi một Order (Entity) thành một DTO (Map) an toàn cho WebSocket/API.
     * (Sao chép từ OrderBatchProcessor/KitchenService để tái sử dụng)
     */
    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        orderDto.put("id", order.getId());
        orderDto.put("status", order.getStatus().toString());
        orderDto.put("pickupWindow", order.getPickupWindow());
        orderDto.put("userId", order.getUser().getId()); // Có thể không cần nếu đã biết userId
        orderDto.put("orderTime", order.getOrderTime()); // Thêm thời gian đặt
        orderDto.put("totalAmount", order.getTotalAmount()); // Thêm tổng tiền

        List<Map<String, Object>> itemDtos = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("menuItemId", item.getMenuItem().getId());
            itemMap.put("quantity", item.getQuantity());
            // Bạn có thể thêm tên và giá món ăn ở đây nếu muốn
            // itemMap.put("name", item.getMenuItem().getName());
            // itemMap.put("price", item.getMenuItem().getPrice());
            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
    // --- KẾT THÚC: THÊM PHƯƠNG THỨC MỚI ---
}