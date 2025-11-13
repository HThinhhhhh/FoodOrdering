package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.dto.CancelRequest;
import com.GourmetGo.foodorderingapp.dto.NoteRequest;
import com.GourmetGo.foodorderingapp.model.Employee; // <-- Thêm import
import com.GourmetGo.foodorderingapp.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.access.AccessDeniedException; // <-- Thêm import
import org.springframework.security.core.annotation.AuthenticationPrincipal; // <-- Thêm import
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@Controller
public class KitchenController {

    @Autowired
    private KitchenService kitchenService;

    @MessageMapping("/kitchen/update-status")
    public void handleStatusUpdate(@Payload UpdateStatusRequest request, @AuthenticationPrincipal Employee employee) {
        String role = "ROLE_" + employee.getRole().name();
        kitchenService.updateOrderStatus(request, role);
    }

    @GetMapping("/api/kitchen/active-orders")
    @ResponseBody
    public List<Map<String, Object>> getActiveOrders() {
        return kitchenService.getActiveOrders();
    }

    @PostMapping("/api/kitchen/cancel-order")
    @ResponseBody
    public ResponseEntity<String> cancelOrder(
            @RequestBody CancelRequest request,
            @AuthenticationPrincipal Employee employee) { // <-- Lấy Employee
        try {
            String role = "ROLE_" + employee.getRole().name();
            kitchenService.cancelOrder(request, role); // <-- Truyền vai trò
            return ResponseEntity.ok("Đơn hàng đã được hủy.");
        } catch (IllegalStateException | AccessDeniedException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi hủy đơn hàng.");
        }
    }

    @PostMapping("/api/kitchen/order/{id}/kitchen-note")
    @ResponseBody
    public ResponseEntity<String> addKitchenNote(
            @PathVariable Long id,
            @RequestBody NoteRequest request) {
        try {
            kitchenService.addKitchenNote(id, request.getNote());
            return ResponseEntity.ok("Đã thêm ghi chú bếp.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi thêm ghi chú.");
        }
    }
}