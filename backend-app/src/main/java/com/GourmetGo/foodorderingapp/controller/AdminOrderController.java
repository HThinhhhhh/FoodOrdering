package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.NoteRequest;
import com.GourmetGo.foodorderingapp.dto.OrderEditRequest;
import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.model.Employee; // <-- Thêm import
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import com.GourmetGo.foodorderingapp.service.KitchenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal; // <-- Thêm import
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    @Autowired
    private KitchenService kitchenService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllOrders(
            @RequestParam(required = false) String status) {
        try {
            List<Map<String, Object>> orders = kitchenService.getAllOrdersForAdmin(status);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (bởi Admin/Employee)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody UpdateStatusRequest request,
            @AuthenticationPrincipal Employee employee) { // <-- Lấy Employee
        try {
            if (!id.equals(request.getOrderId())) {
                return ResponseEntity.badRequest().body("ID không khớp.");
            }
            // Lấy vai trò (ADMIN hoặc EMPLOYEE)
            String role = "ROLE_" + employee.getRole().name();
            kitchenService.updateOrderStatus(request, role); // <-- Truyền vai trò
            return ResponseEntity.ok("Cập nhật trạng thái thành công.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // --- API MỚI: Thêm Ghi chú (Admin/Employee) ---
    @PostMapping("/{id}/employee-note")
    public ResponseEntity<String> addEmployeeNote(
            @PathVariable Long id,
            @RequestBody NoteRequest request,
            @AuthenticationPrincipal Employee employee) { // Lấy Employee
        try {
            kitchenService.addEmployeeNote(id, request.getNote(), employee.getUsername());
            return ResponseEntity.ok("Đã thêm ghi chú nhân viên.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // --- API MỚI: Thêm Ghi chú Giao hàng (Admin/Employee) ---
    @PostMapping("/{id}/delivery-note")
    public ResponseEntity<String> addDeliveryNote(
            @PathVariable Long id,
            @RequestBody NoteRequest request) {
        try {
            kitchenService.addDeliveryNote(id, request.getNote());
            return ResponseEntity.ok("Đã thêm ghi chú giao hàng.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    // --- API MỚI: Sửa chi tiết Đơn hàng (Admin/Employee) ---
    @PutMapping("/{id}/details")
    public ResponseEntity<String> editOrderDetails(
            @PathVariable Long id,
            @RequestBody OrderEditRequest request) {
        try {
            kitchenService.editOrderDetails(id, request);
            return ResponseEntity.ok("Đã cập nhật chi tiết đơn hàng.");
        } catch (IllegalStateException e) {
            // Lỗi nghiệp vụ (ví dụ: đơn đã bị bếp nhận)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (RuntimeException e) {
            // Lỗi không tìm thấy
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}