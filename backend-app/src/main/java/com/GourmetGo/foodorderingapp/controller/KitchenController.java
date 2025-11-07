package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

// --- THÊM CÁC IMPORT NÀY ---
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import java.util.List;
import java.util.Map;
// --- KẾT THÚC THÊM IMPORT ---

@Controller
public class KitchenController {

    @Autowired
    private KitchenService kitchenService;

    /**
     * Lắng nghe các tin nhắn từ Bếp (KDS) gửi đến
     * đích "/app/kitchen/update-status".
     */
    @MessageMapping("/kitchen/update-status")
    public void handleStatusUpdate(@Payload UpdateStatusRequest request) {
        kitchenService.updateOrderStatus(request);
    }

    // --- BẮT ĐẦU: THÊM API ENDPOINT MỚI ---
    /**
     * Cung cấp API REST để KDS lấy tất cả các đơn hàng đang hoạt động
     * khi tải trang lần đầu.
     */
    @GetMapping("/api/kitchen/active-orders")
    @ResponseBody // (Vì đây là @Controller, không phải @RestController)
    public List<Map<String, Object>> getActiveOrders() {
        return kitchenService.getActiveOrders();
    }
    // --- KẾT THÚC: THÊM API ENDPOINT MỚI ---
}