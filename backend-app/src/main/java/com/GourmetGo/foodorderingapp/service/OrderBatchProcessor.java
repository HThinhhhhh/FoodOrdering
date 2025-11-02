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

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * Chạy mỗi 5 giây để xử lý các đơn hàng trong hàng đợi Redis.
     */
    @Scheduled(fixedRate = 5000) // 5000 ms = 5 giây
    @Transactional // Đảm bảo tất cả đơn hàng được lưu hoặc không lưu gì cả (nếu lỗi)
    public void processOrderQueue() {
        log.info("Đang kiểm tra hàng đợi đơn hàng...");

        // 1. Lấy TẤT CẢ các mục từ hàng đợi (list) trong Redis.
        // Đây là bước đầu tiên trong "atomic batch"
        List<String> orderJsonList = redisTemplate.opsForList().range(ORDER_QUEUE_KEY, 0, -1);

        // 2. Nếu không có đơn hàng nào, return.
        if (orderJsonList == null || orderJsonList.isEmpty()) {
            log.info("Hàng đợi trống, không có gì để xử lý.");
            return;
        }

        log.info("Tìm thấy {} đơn hàng trong hàng đợi. Bắt đầu xử lý...", orderJsonList.size());

        List<Order> ordersToSave = new ArrayList<>();

        // 3. Lặp qua danh sách JSON và deserialize
        for (String orderJson : orderJsonList) {
            try {
                // Deserialize JSON thành DTO
                OrderRequest request = objectMapper.readValue(orderJson, OrderRequest.class);

                // Chuyển đổi DTO (Request) thành Entity (Model)
                Order order = transformRequestToOrder(request);

                ordersToSave.add(order);

            } catch (Exception e) {
                // Nếu một đơn hàng bị lỗi (ví dụ: JSON sai, user/item không tồn tại),
                // chúng ta ghi log và tiếp tục xử lý các đơn hàng khác.
                // Trong môi trường production, đơn hàng lỗi này nên được chuyển
                // sang một "Dead-Letter Queue" (DLQ) để điều tra.
                log.error("Lỗi xử lý đơn hàng JSON: {}. Lỗi: {}", orderJson, e.getMessage());
            }
        }

        // 4. Lưu tất cả chúng vào CSDL PostgreSQL
        if (!ordersToSave.isEmpty()) {
            orderRepository.saveAll(ordersToSave);
            log.info("Đã lưu thành công {} đơn hàng vào CSDL.", ordersToSave.size());
        }

        // 5. Sau khi xử lý, xóa các mục đã lấy ra khỏi hàng đợi.
        // Chúng ta trim (cắt) danh sách, chỉ giữ lại các phần tử TỪ sau
        // vị trí cuối cùng chúng ta đã đọc (orderJsonList.size())
        redisTemplate.opsForList().trim(ORDER_QUEUE_KEY, orderJsonList.size(), -1);
    }

    /**
     * Phương thức trợ giúp để chuyển đổi OrderRequest (DTO)
     * thành một Order (Entity) sẵn sàng để lưu vào CSDL.
     */
    private Order transformRequestToOrder(OrderRequest request) {
        // Tra cứu User (giả định User luôn tồn tại)
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy User ID: " + request.getUserId()));

        Order order = new Order();
        order.setUser(user);
        order.setPickupWindow(request.getPickupWindow());
        order.setStatus(OrderStatus.RECEIVED); // Trạng thái ban đầu

        Set<OrderItem> orderItems = new HashSet<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Xử lý từng món hàng và tính tổng tiền
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy MenuItem ID: " + itemRequest.getMenuItemId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setOrder(order); // Liên kết OrderItem với Order cha
            orderItems.add(orderItem);

            // Cộng vào tổng tiền
            BigDecimal itemCost = menuItem.getPrice().multiply(new BigDecimal(itemRequest.getQuantity()));
            totalAmount = totalAmount.add(itemCost);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalAmount);

        // orderTime sẽ được tự động gán bởi @CreationTimestamp

        return order;
    }
}