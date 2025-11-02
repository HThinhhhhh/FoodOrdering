package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderItemRequest;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.*;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import com.GourmetGo.foodorderingapp.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

// Dùng cho log, tốt hơn System.out.println
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

// --- BẮT ĐẦU SỬA ĐỔI 1: THÊM IMPORT ---
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
// --- KẾT THÚC SỬA ĐỔI 1 ---


@Service
public class OrderBatchProcessor {

    private static final Logger log = LoggerFactory.getLogger(OrderBatchProcessor.class);
    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    // --- BẮT ĐẦU SỬA ĐỔI 2: THÊM DEPENDENCY ---
    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Thêm dòng này
    // --- KẾT THÚC SỬA ĐỔI 2 ---

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Chạy mỗi 5 giây để xử lý các đơn hàng trong hàng đợi Redis.
     */
    @Scheduled(fixedRate = 5000) // 5000 ms = 5 giây
    @Transactional
    public void processOrderQueue() {
        log.info("Đang kiểm tra hàng đợi đơn hàng...");

        List<String> orderJsonList = redisTemplate.opsForList().range(ORDER_QUEUE_KEY, 0, -1);

        if (orderJsonList == null || orderJsonList.isEmpty()) {
            log.info("Hàng đợi trống, không có gì để xử lý.");
            return;
        }

        log.info("Tìm thấy {} đơn hàng trong hàng đợi. Bắt đầu xử lý...", orderJsonList.size());

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

        // 4. Lưu tất cả chúng vào CSDL PostgreSQL
        if (!ordersToSave.isEmpty()) {
            // --- BẮT ĐẦU SỬA ĐỔI 3: GỬI WEBSOCKET SAU KHI LƯU ---
            // 4a. Lưu và lấy lại danh sách đã lưu (để có ID)
            List<Order> savedOrders = orderRepository.saveAll(ordersToSave);
            log.info("Đã lưu thành công {} đơn hàng vào CSDL.", savedOrders.size());

            // 4b. Gửi thông báo real-time cho TỪNG đơn hàng
            for (Order savedOrder : savedOrders) {

                // Tạo một DTO (dưới dạng Map) để gửi đi,
                // tránh lỗi LazyInitializationException khi gửi Entity
                Map<String, Object> orderDto = new HashMap<>();
                orderDto.put("id", savedOrder.getId()); // KDS cần
                orderDto.put("status", savedOrder.getStatus().toString()); // KDS cần
                orderDto.put("pickupWindow", savedOrder.getPickupWindow()); // Thông tin thêm
                orderDto.put("userId", savedOrder.getUser().getId()); // Thông tin thêm

                // Thêm chi tiết các món ăn
                List<Map<String, Object>> itemDtos = savedOrder.getItems().stream().map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("menuItemId", item.getMenuItem().getId());
                    itemMap.put("quantity", item.getQuantity());
                    return itemMap;
                }).collect(Collectors.toList());

                orderDto.put("items", itemDtos); // KDS cần

                // 4c. Gửi DTO đến kênh WebSocket
                log.info("Đang gửi đơn hàng DTO tới /topic/kitchen: {}", orderDto);
                messagingTemplate.convertAndSend("/topic/kitchen", orderDto);
            }
            // --- KẾT THÚC SỬA ĐỔI 3 ---
        }

        // 5. Xóa các mục đã xử lý khỏi hàng đợi
        redisTemplate.opsForList().trim(ORDER_QUEUE_KEY, orderJsonList.size(), -1);
    }

    /**
     * (Hàm này giữ nguyên)
     * Phương thức trợ giúp để chuyển đổi OrderRequest (DTO)
     * thành một Order (Entity) sẵn sàng để lưu vào CSDL.
     */
    private Order transformRequestToOrder(OrderRequest request) {
        // ... (Giữ nguyên code của bạn) ...
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User ID: " + request.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setPickupWindow(request.getPickupWindow());
        order.setStatus(OrderStatus.RECEIVED); // Trạng thái ban đầu

        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy MenuItem ID: " + itemRequest.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setOrder(order);
            orderItems.add(orderItem);

            BigDecimal itemCost = menuItem.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemCost);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        return order;
    }
}