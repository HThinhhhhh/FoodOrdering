package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.dto.CancelRequest; // 1. IMPORT MỚI
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class KitchenService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // (getActiveOrders() giữ nguyên)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveOrders() {
        List<Order> activeOrders = orderRepository.findByStatusNot(OrderStatus.COMPLETED);
        return activeOrders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }

    // (updateOrderStatus() giữ nguyên)
    @Transactional
    public void updateOrderStatus(UpdateStatusRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + request.getOrderId()));

        order.setStatus(request.getNewStatus());
        orderRepository.save(order);

        String userSpecificTopic = "/topic/order-status/" + request.getOrderId();
        System.out.println("Đang gửi cập nhật trạng thái (" + request.getNewStatus()
                + ") tới kênh: " + userSpecificTopic);

        // Gửi trạng thái mới cho khách
        messagingTemplate.convertAndSend(userSpecificTopic, Map.of("newStatus", request.getNewStatus().toString()));
    }

    // --- BẮT ĐẦU: THÊM HÀM MỚI (Goal 1, 3) ---
    @Transactional
    public void cancelOrder(CancelRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + request.getOrderId()));

        // (Goal 1) Chỉ hủy đơn chưa COMPLETED
        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Không thể hủy đơn hàng đã hoàn thành.");
        }

        // Cập nhật trạng thái và lý do
        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason()); // (Goal 3)
        orderRepository.save(order);

        // Gửi thông báo real-time cho Khách hàng
        String userSpecificTopic = "/topic/order-status/" + request.getOrderId();

        // (Goal 3) Gửi trạng thái MỚI và LÝ DO
        Map<String, String> payload = Map.of(
                "newStatus", OrderStatus.CANCELLED.toString(),
                "reason", request.getReason()
        );

        messagingTemplate.convertAndSend(userSpecificTopic, payload);
    }
    // --- KẾT THÚC: THÊM HÀM MỚI ---


    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        // ... (id, status, pickupWindow, userId, orderTime, chi phí, địa chỉ... giữ nguyên)
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

        // --- THÊM TRƯỜNG MỚI (Goal 3) ---
        orderDto.put("cancellationReason", order.getCancellationReason());
        // --- KẾT THÚC THÊM ---

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