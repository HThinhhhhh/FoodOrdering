package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus; // <-- THÊM IMPORT
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// --- THÊM CÁC IMPORT NÀY ---
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;
// --- KẾT THÚC THÊM IMPORT ---

@Service
public class KitchenService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // --- BẮT ĐẦU: THÊM PHƯƠNG THỨC MỚI ---

    /**
     * Lấy tất cả các đơn hàng đang hoạt động (chưa hoàn thành) cho KDS.
     * Trả về danh sách các DTO (dưới dạng Map) để tránh lỗi Lazy Loading.
     */
    @Transactional(readOnly = true) // Quan trọng: readOnly = true
    public List<Map<String, Object>> getActiveOrders() {
        // Lấy tất cả đơn hàng CHƯA ở trạng thái COMPLETED
        List<Order> activeOrders = orderRepository.findByStatusNot(OrderStatus.COMPLETED);

        // Chuyển đổi List<Order> thành List<Map> (DTO)
        return activeOrders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }
    // --- KẾT THÚC: THÊM PHƯƠNG THỨC MỚI ---


    /**
     * Xử lý logic cập nhật trạng thái đơn hàng từ Bếp.
     */
    @Transactional
    public void updateOrderStatus(UpdateStatusRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + request.getOrderId()));

        order.setStatus(request.getNewStatus());
        orderRepository.save(order);

        // Gửi cập nhật này cho ĐÚNG Thực khách (Diner)
        String userSpecificTopic = "/topic/order-status/" + request.getOrderId();

        System.out.println("Đang gửi cập nhật trạng thái (" + request.getNewStatus()
                + ") tới kênh: " + userSpecificTopic);

        messagingTemplate.convertAndSend(userSpecificTopic, request);
    }

    // --- BẮT ĐẦU: THÊM PHƯƠNG THỨC TRỢ GIÚP ---
    // (Tái sử dụng logic từ OrderBatchProcessor)
    /**
     * Chuyển đổi một Order (Entity) thành một DTO (Map) an toàn cho WebSocket/API.
     */
    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        orderDto.put("id", order.getId());
        orderDto.put("status", order.getStatus().toString());
        orderDto.put("pickupWindow", order.getPickupWindow());
        orderDto.put("userId", order.getUser().getId());

        List<Map<String, Object>> itemDtos = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("menuItemId", item.getMenuItem().getId());
            itemMap.put("quantity", item.getQuantity());
            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
    // --- KẾT THÚC: THÊM PHƯƠNG THỨC TRỢ GIÚP ---
}