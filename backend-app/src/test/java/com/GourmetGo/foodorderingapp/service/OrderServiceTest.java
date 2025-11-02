package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.OrderItemRequest;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
// Thêm 2 dòng này vào đầu tệp OrderServiceTest.java của bạn
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

import java.time.LocalDateTime;
import java.util.List;

// 1. Sử dụng JUnit 5 và Mockito
@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    // 2. Tạo mock cho tất cả các dependency
    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    // Mock ListOperations (vì redisTemplate.opsForList() trả về nó)
    @Mock
    private ListOperations<String, String> listOperations;

    // Mock OrderRepository để xác minh nó KHÔNG BAO GIỜ được gọi
    @Mock
    private OrderRepository orderRepository;

    // 3. Tiêm các mock vào service cần test
    @InjectMocks
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        // Cần thiết lập cho ObjectMapper nội bộ (vì @PostConstruct)
        orderService.init();

        // Khi redisTemplate.opsForList() được gọi, hãy trả về mock listOperations
        when(redisTemplate.opsForList()).thenReturn(listOperations);
    }

    @Test
    void testSubmitOrder() throws Exception {
        // --- 1. Arrange (Sắp xếp) ---

        // Tạo một DTO yêu cầu mẫu
        OrderRequest request = new OrderRequest();
        request.setUserId(1L);
        request.setPickupWindow(LocalDateTime.now());
        OrderItemRequest item = new OrderItemRequest();
        item.setMenuItemId(10L);
        item.setQuantity(2);
        request.setItems(List.of(item));

        // --- 2. Act (Hành động) ---
        orderService.submitOrder(request);

        // --- 3. Assert (Xác minh) ---

        // Verify (xác minh) rằng redisTemplate.opsForList().leftPush()
        // được gọi ĐÚNG 1 LẦN với đúng tên hàng đợi và bất kỳ chuỗi JSON nào.
        verify(redisTemplate, times(1)).opsForList();
        verify(listOperations, times(1)).leftPush(
                eq("order_queue"),
                any(String.class)
        );

        // Verify (xác minh) rằng messagingTemplate.convertAndSend()
        // được gọi ĐÚNG 1 LẦN với đúng kênh và đúng đối tượng request.
        verify(messagingTemplate, times(1)).convertAndSend(
                eq("/topic/kitchen"),
                eq(request)
        );

        // Verify (xác minh) rằng orderRepository.save() KHÔNG BAO GIỜ được gọi.
        // Điều này rất quan trọng để đảm bảo service này chỉ đẩy vào queue.
        verify(orderRepository, never()).save(any(Order.class));
    }
}