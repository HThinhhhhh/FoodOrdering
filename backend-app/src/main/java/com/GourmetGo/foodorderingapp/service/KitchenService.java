package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KitchenService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Xử lý logic cập nhật trạng thái đơn hàng từ Bếp.
     *
     * @param request Yêu cầu chứa ID đơn hàng và trạng thái mới.
     */
    @Transactional // Đảm bảo việc tìm và lưu là một giao dịch (transaction)
    public void updateOrderStatus(UpdateStatusRequest request) {

        // 1. Tìm Order trong CSDL
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + request.getOrderId()));

        // 2. Cập nhật trạng thái và lưu lại
        order.setStatus(request.getNewStatus());
        orderRepository.save(order);

        // 3. Gửi cập nhật này cho ĐÚNG Thực khách (Diner)
        // Bằng cách tạo một kênh (topic) động dựa trên ID đơn hàng.
        // App của thực khách sẽ lắng nghe trên kênh này.
        String userSpecificTopic = "/topic/order-status/" + request.getOrderId();

        System.out.println("Đang gửi cập nhật trạng thái (" + request.getNewStatus()
                + ") tới kênh: " + userSpecificTopic);

        // Gửi toàn bộ DTO (chứa cả ID và Status) về cho client
        messagingTemplate.convertAndSend(userSpecificTopic, request);
    }
}