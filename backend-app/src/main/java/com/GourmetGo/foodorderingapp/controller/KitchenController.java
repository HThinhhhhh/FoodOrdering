package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller // Quan trọng: Đây là @Controller, không phải @RestController
public class KitchenController {

    @Autowired
    private KitchenService kitchenService;

    /**
     * Lắng nghe các tin nhắn từ Bếp (KDS) gửi đến
     * đích "/app/kitchen/update-status".
     *
     * @param request DTO chứa orderId và trạng thái mới.
     */
    @MessageMapping("/kitchen/update-status")
    public void handleStatusUpdate(@Payload UpdateStatusRequest request) {
        // Client (KDS) gửi tin nhắn đến "/app/kitchen/update-status"
        // Phương thức này sẽ được gọi

        // Chúng ta chỉ cần ủy quyền cho Service xử lý
        // Service sẽ tự động thông báo cho Thực khách (Diner)
        kitchenService.updateOrderStatus(request);
    }
}