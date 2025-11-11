package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderItemRequest;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.*;
import com.GourmetGo.foodorderingapp.repository.CustomerRepository; // <-- 1. SỬA
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderBatchProcessor {

    private static final Logger log = LoggerFactory.getLogger(OrderBatchProcessor.class);
    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired private RedisTemplate<String, String> redisTemplate;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CustomerRepository customerRepository; // <-- 2. SỬA
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void processOrderQueue() {
        // (Logic lấy queue giữ nguyên)
        log.info("Đang kiểm tra hàng đợi đơn hàng...");
        List<String> orderJsonList = redisTemplate.opsForList().range(ORDER_QUEUE_KEY, 0, -1);
        if (orderJsonList == null || orderJsonList.isEmpty()) { log.info("Hàng đợi trống, không có gì để xử lý."); return; }
        log.info("Tìm thấy {} đơn hàng...", orderJsonList.size());
        List<Order> ordersToSave = new ArrayList<>();

        for (String orderJson : orderJsonList) {
            try {
                OrderRequest request = objectMapper.readValue(orderJson, OrderRequest.class);
                Order order = transformRequestToOrder(request);
                ordersToSave.add(order);
            } catch (Exception e) {
                log.error("Lỗi xử lý đơn hàng JSON: {}. Lỗi: {}", orderJson, e.getMessage());
            }
        }

        if (!ordersToSave.isEmpty()) {
            List<Order> savedOrders = orderRepository.saveAll(ordersToSave);
            log.info("Đã lưu thành công {} đơn hàng vào CSDL.", savedOrders.size());

            for (Order savedOrder : savedOrders) {
                Map<String, Object> orderDto = convertOrderToDto(savedOrder);
                log.info("Đang gửi đơn hàng DTO tới /topic/kitchen: {}", orderDto);
                messagingTemplate.convertAndSend("/topic/kitchen", orderDto);
            }
        }
        redisTemplate.opsForList().trim(ORDER_QUEUE_KEY, orderJsonList.size(), -1);
    }

    private Order transformRequestToOrder(OrderRequest request) {
        // --- 3. SỬA: Tìm Customer (thay vì User) ---
        Customer customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Customer ID: " + request.getUserId()));

        Order order = new Order();
        order.setCustomer(customer); // <-- 4. SỬA
        order.setPickupWindow(request.getPickupWindow());
        order.setStatus(OrderStatus.RECEIVED);

        // (Thêm các trường mới: deliveryAddress, shipperNote, paymentMethod, chi phí...)
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setShipperNote(request.getShipperNote());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setSubtotal(request.getSubtotal());
        order.setVatAmount(request.getVatAmount());
        order.setShippingFee(request.getShippingFee());
        order.setGrandTotal(request.getGrandTotal());

        // (Logic xử lý items/note giữ nguyên)
        Set<OrderItem> orderItems = new HashSet<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy MenuItem ID: " + itemRequest.getMenuItemId()));
            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setOrder(order);
            if (itemRequest.getNote() != null && !itemRequest.getNote().isBlank()) {
                orderItem.setNote(itemRequest.getNote());
            }
            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        return order;
    }

    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        orderDto.put("id", order.getId());
        orderDto.put("status", order.getStatus().toString());
        orderDto.put("pickupWindow", order.getPickupWindow());
        orderDto.put("userId", order.getCustomer().getId()); // <-- 5. SỬA: getUser() -> getCustomer()
        orderDto.put("orderTime", order.getOrderTime());

        // (Các trường mới: deliveryAddress, shipperNote, paymentMethod, chi phí...)
        orderDto.put("deliveryAddress", order.getDeliveryAddress());
        orderDto.put("shipperNote", order.getShipperNote());
        orderDto.put("paymentMethod", order.getPaymentMethod());
        orderDto.put("subtotal", order.getSubtotal());
        orderDto.put("vatAmount", order.getVatAmount());
        orderDto.put("shippingFee", order.getShippingFee());
        orderDto.put("grandTotal", order.getGrandTotal());
        orderDto.put("cancellationReason", order.getCancellationReason());

        // (Logic xử lý itemDtos/note giữ nguyên)
        List<Map<String, Object>> itemDtos = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("menuItemId", item.getMenuItem().getId());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("note", item.getNote());
            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
}