package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.dto.CancelRequest; // 1. IMPORT MỚI
import com.GourmetGo.foodorderingapp.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

// --- THÊM CÁC IMPORT NÀY ---
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
// --- KẾT THÚC THÊM IMPORT ---

import java.util.List;
import java.util.Map;

@Controller
public class KitchenController {

    @Autowired
    private KitchenService kitchenService;

    // (handleStatusUpdate() giữ nguyên)
    @MessageMapping("/kitchen/update-status")
    public void handleStatusUpdate(@Payload UpdateStatusRequest request) {
        kitchenService.updateOrderStatus(request);
    }

    // (getActiveOrders() giữ nguyên)
    @GetMapping("/api/kitchen/active-orders")
    @ResponseBody
    public List<Map<String, Object>> getActiveOrders() {
        return kitchenService.getActiveOrders();
    }

    // --- BẮT ĐẦU: THÊM API HỦY ĐƠN (Goal 2) ---
    @PostMapping("/api/kitchen/cancel-order")
    @ResponseBody // (Vì đây là @Controller, không phải @RestController)
    public ResponseEntity<String> cancelOrder(@RequestBody CancelRequest request) {
        try {
            kitchenService.cancelOrder(request);
            return ResponseEntity.ok("Đơn hàng đã được hủy.");
        } catch (IllegalStateException e) {
            // (Ví dụ: Đơn hàng đã hoàn thành)
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi hủy đơn hàng.");
        }
    }
    // --- KẾT THÚC: THÊM API HỦY ĐƠN ---
}