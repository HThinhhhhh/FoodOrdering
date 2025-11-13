package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.dto.ReOrderItemDTO;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final String ORDER_QUEUE_KEY = "order_queue";
    @Autowired private RedisTemplate<String, String> redisTemplate;
    @Autowired private OrderRepository orderRepository;
    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    public void submitOrder(OrderRequest request) {
        try {
            String orderJsonString = objectMapper.writeValueAsString(request);
            redisTemplate.opsForList().leftPush(ORDER_QUEUE_KEY, orderJsonString);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi xử lý yêu cầu đơn hàng.", e);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getOrdersForUser(Long customerId) {
        List<Order> orders = orderRepository.findByCustomerIdOrderByOrderTimeDesc(customerId);
        return orders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReOrderItemDTO> getReOrderData(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng ID: " + orderId));
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new SecurityException("Bạn không có quyền đặt lại đơn hàng này.");
        }
        return order.getItems().stream()
                .map(item -> new ReOrderItemDTO(
                        item.getMenuItem().getId(),
                        item.getQuantity(),
                        item.getNote()
                ))
                .collect(Collectors.toList());
    }

    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        orderDto.put("id", order.getId());
        orderDto.put("userId", order.getCustomer().getId());
        orderDto.put("status", order.getStatus().toString());
        orderDto.put("orderTime", order.getOrderTime());
        orderDto.put("deliveryAddress", order.getDeliveryAddress());
        orderDto.put("shipperNote", order.getShipperNote());
        orderDto.put("deliveryNote", order.getDeliveryNote()); // (Ghi chú của Admin/NV giao hàng)
        orderDto.put("paymentMethod", order.getPaymentMethod());
        orderDto.put("subtotal", order.getSubtotal());
        orderDto.put("vatAmount", order.getVatAmount());
        orderDto.put("shippingFee", order.getShippingFee());
        orderDto.put("discountAmount", order.getDiscountAmount());
        orderDto.put("grandTotal", order.getGrandTotal());
        orderDto.put("isReviewed", order.isReviewed());
        orderDto.put("cancellationReason", order.getCancellationReason());
        orderDto.put("customerPhone", order.getCustomer().getPhoneNumber()); // (Thêm cho AdminReviewPage)

        List<Map<String, Object>> itemDtos = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("menuItemId", item.getMenuItem().getId());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("note", item.getNote());
            itemMap.put("name", item.getMenuItem().getName());

            // --- THÊM 2 DÒNG CÒN THIẾU ---
            itemMap.put("pricePerUnit", item.getPricePerUnit());
            itemMap.put("selectedOptionsText", item.getSelectedOptionsText());
            // --- KẾT THÚC THÊM MỚI ---

            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
}