package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private OrderRepository orderRepository;

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    // (submitOrder giữ nguyên)
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

    // (getOrdersForUser giữ nguyên)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrdersForUser(Long userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByOrderTimeDesc(userId);
        return orders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi một Order (Entity) thành một DTO (Map) an toàn cho WebSocket/API.
     */
    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        orderDto.put("id", order.getId());
        orderDto.put("status", order.getStatus().toString());
        orderDto.put("pickupWindow", order.getPickupWindow());
        orderDto.put("userId", order.getUser().getId());
        orderDto.put("orderTime", order.getOrderTime());
        orderDto.put("deliveryAddress", order.getDeliveryAddress());
        orderDto.put("shipperNote", order.getShipperNote());
        orderDto.put("paymentMethod", order.getPaymentMethod());
        orderDto.put("subtotal", order.getSubtotal());
        orderDto.put("vatAmount", order.getVatAmount());
        orderDto.put("shippingFee", order.getShippingFee());
        orderDto.put("grandTotal", order.getGrandTotal());
        orderDto.put("isReviewed", order.isReviewed());
        orderDto.put("orderTime", order.getOrderTime());

        orderDto.put("cancellationReason", order.getCancellationReason());

        List<Map<String, Object>> itemDtos = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("menuItemId", item.getMenuItem().getId());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("note", item.getNote());
            itemMap.put("name", item.getMenuItem().getName());
            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
}