package com.GourmetGo.foodorderingapp.service;

import com.GourmetGo.foodorderingapp.dto.CancelRequest;
import com.GourmetGo.foodorderingapp.dto.NoteRequest;
import com.GourmetGo.foodorderingapp.dto.OrderEditRequest;
import com.GourmetGo.foodorderingapp.dto.UpdateStatusRequest;
import com.GourmetGo.foodorderingapp.model.Order;
import com.GourmetGo.foodorderingapp.model.OrderStatus;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveOrders() {
        List<OrderStatus> kitchenStatuses = List.of(
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY
        );
        List<Order> activeOrders = orderRepository.findByStatusInOrderByOrderTimeAsc(kitchenStatuses);

        return activeOrders.stream()
                .map(this::convertOrderToDto)
                .collect(Collectors.toList());
    }

    /**
     * (Dùng cho KDS/ADMIN/EMPLOYEE) Cập nhật trạng thái
     */
    @Transactional
    public void updateOrderStatus(UpdateStatusRequest request, String role) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + request.getOrderId()));

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getNewStatus();

        // --- KIỂM TRA QUYỀN (LOGIC MỚI) ---
        if (role.equals("ROLE_KITCHEN")) {
            // Bếp chỉ được phép chuyển RECEIVED -> PREPARING -> READY
            if (!((oldStatus == OrderStatus.RECEIVED && newStatus == OrderStatus.PREPARING) ||
                    (oldStatus == OrderStatus.PREPARING && newStatus == OrderStatus.READY))) {
                throw new AccessDeniedException("Bếp không có quyền chuyển trạng thái này.");
            }
        }
        // (Admin/Employee có quyền chuyển các trạng thái khác,
        //  ví dụ: PENDING -> RECEIVED, READY -> DELIVERING, DELIVERING -> COMPLETED)

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // 1. Gửi cho Khách hàng
        String userSpecificTopic = "/topic/order-status/" + request.getOrderId();
        Map<String, String> payload = new HashMap<>();
        payload.put("newStatus", newStatus.toString());
        messagingTemplate.convertAndSend(userSpecificTopic, payload);

        // 2. Gửi cho Admin/Employee
        messagingTemplate.convertAndSend("/topic/admin/order-updates", convertOrderToDto(savedOrder));

        // 3. Gửi cho Bếp (Nếu Admin/Employee xác nhận)
        if (oldStatus == OrderStatus.PENDING_CONFIRMATION && newStatus == OrderStatus.RECEIVED) {
            messagingTemplate.convertAndSend("/topic/kitchen", convertOrderToDto(savedOrder));
        }
    }

    /**
     * (Dùng cho KDS/ADMIN/EMPLOYEE) Hủy đơn hàng
     */
    @Transactional
    public void cancelOrder(CancelRequest request, String role) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + request.getOrderId()));

        if (order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalStateException("Không thể hủy đơn hàng đã hoàn thành.");
        }

        // --- LOGIC RÀNG BUỘC HỦY ĐƠN ---
        OrderStatus currentStatus = order.getStatus();
        if (role.equals("ROLE_KITCHEN")) {
            if (currentStatus != OrderStatus.RECEIVED && currentStatus != OrderStatus.PREPARING) {
                throw new AccessDeniedException("Bếp chỉ có thể hủy đơn hàng ở trạng thái RECEIVED hoặc PREPARING.");
            }
        } else if (role.equals("ROLE_ADMIN") || role.equals("ROLE_EMPLOYEE")) {
            if (currentStatus == OrderStatus.RECEIVED || currentStatus == OrderStatus.PREPARING) {
                throw new AccessDeniedException("Không thể hủy khi Bếp đang chuẩn bị. Vui lòng yêu cầu Bếp hủy.");
            }
        } else {
            throw new AccessDeniedException("Vai trò không xác định, không thể hủy.");
        }
        // --- KẾT THÚC LOGIC ---

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancellationReason(request.getReason());
        Order savedOrder = orderRepository.save(order);

        String userSpecificTopic = "/topic/order-status/" + request.getOrderId();
        Map<String, String> payload = Map.of(
                "newStatus", OrderStatus.CANCELLED.toString(),
                "reason", request.getReason()
        );
        messagingTemplate.convertAndSend(userSpecificTopic, payload);

        messagingTemplate.convertAndSend("/topic/admin/order-updates", convertOrderToDto(savedOrder));
    }

    // (Hàm getAllOrdersForAdmin, addKitchenNote, addEmployeeNote, addDeliveryNote, editOrderDetails giữ nguyên)
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllOrdersForAdmin(String statusFilter) {
        List<Order> orders;
        if (statusFilter != null && !statusFilter.isBlank() && !statusFilter.equals("ALL")) {
            try {
                OrderStatus status = OrderStatus.valueOf(statusFilter.toUpperCase());
                orders = orderRepository.findByStatusOrderByOrderTimeDesc(status);
            } catch (IllegalArgumentException e) {
                return List.of();
            }
        } else {
            orders = orderRepository.findAllByOrderByOrderTimeDesc();
        }
        return orders.stream().map(this::convertOrderToDto).collect(Collectors.toList());
    }

    @Transactional
    public Order addKitchenNote(Long orderId, String note) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + orderId));
        order.setKitchenNote(note);
        Order savedOrder = orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/admin/order-updates", convertOrderToDto(savedOrder));
        return savedOrder;
    }

    @Transactional
    public Order addEmployeeNote(Long orderId, String note, String username) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + orderId));
        String formattedNote = (order.getEmployeeNote() == null ? "" : order.getEmployeeNote() + "\n")
                + "[" + username + " - " + DateTimeFormatter.ofPattern("HH:mm dd/MM").format(LocalDateTime.now()) + "]: " + note;
        order.setEmployeeNote(formattedNote);
        Order savedOrder = orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/admin/order-updates", convertOrderToDto(savedOrder));
        return savedOrder;
    }

    @Transactional
    public Order addDeliveryNote(Long orderId, String note) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + orderId));

        // --- BẮT ĐẦU: LOGIC RÀNG BUỘC MỚI ---
        OrderStatus currentStatus = order.getStatus();
        if (currentStatus == OrderStatus.DELIVERING ||
                currentStatus == OrderStatus.COMPLETED ||
                currentStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Không thể cập nhật ghi chú giao hàng khi đơn đang được giao hoặc đã hoàn thành/hủy.");
        }
        // --- KẾT THÚC: LOGIC RÀNG BUỘC MỚI ---

        order.setDeliveryNote(note);
        Order savedOrder = orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/admin/order-updates", convertOrderToDto(savedOrder));
        String userSpecificTopic = "/topic/order-status/" + orderId;
        Map<String, String> payload = Map.of(
                "newStatus", order.getStatus().toString(),
                "deliveryNote", note
        );
        messagingTemplate.convertAndSend(userSpecificTopic, payload);
        return savedOrder;
    }

    @Transactional
    public Order editOrderDetails(Long orderId, OrderEditRequest dto) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new RuntimeException("Không tìm thấy Order ID: " + orderId));
        if (order.getStatus() != OrderStatus.PENDING_CONFIRMATION) {
            throw new IllegalStateException("Không thể sửa đơn hàng đã được xác nhận.");
        }
        order.setDeliveryAddress(dto.getDeliveryAddress());
        order.setShipperNote(dto.getShipperNote());
        Order savedOrder = orderRepository.save(order);
        messagingTemplate.convertAndSend("/topic/admin/order-updates", convertOrderToDto(savedOrder));
        return savedOrder;
    }

    // --- BẮT ĐẦU SỬA ĐỔI TẠI ĐÂY ---
    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        orderDto.put("id", order.getId());
        orderDto.put("status", order.getStatus().toString());
        orderDto.put("pickupWindow", order.getPickupWindow());
        orderDto.put("userId", order.getCustomer().getId());
        orderDto.put("customerName", order.getCustomer().getName());
        orderDto.put("customerPhone", order.getCustomer().getPhoneNumber());
        orderDto.put("orderTime", order.getOrderTime());
        orderDto.put("deliveryAddress", order.getDeliveryAddress());
        orderDto.put("shipperNote", order.getShipperNote());
        orderDto.put("paymentMethod", order.getPaymentMethod());
        orderDto.put("subtotal", order.getSubtotal());
        orderDto.put("vatAmount", order.getVatAmount());
        orderDto.put("shippingFee", order.getShippingFee());
        orderDto.put("grandTotal", order.getGrandTotal());
        orderDto.put("isReviewed", order.isReviewed());
        orderDto.put("deliveryRating", order.getDeliveryRating());
        orderDto.put("deliveryComment", order.getDeliveryComment());
        orderDto.put("cancellationReason", order.getCancellationReason());
        orderDto.put("kitchenNote", order.getKitchenNote());
        orderDto.put("deliveryNote", order.getDeliveryNote());
        orderDto.put("employeeNote", order.getEmployeeNote());
        orderDto.put("voucherCode", order.getVoucherCode());
        orderDto.put("discountAmount", order.getDiscountAmount());

        List<Map<String, Object>> itemDtos = order.getItems().stream().map(item -> {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("menuItemId", item.getMenuItem().getId());
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("note", item.getNote());
            itemMap.put("name", item.getMenuItem().getName());

            // --- THÊM 2 DÒNG CÒN THIẾU ---
            itemMap.put("pricePerUnit", item.getPricePerUnit());
            itemMap.put("selectedOptionsText", item.getSelectedOptionsText());
            // --- KẾT THÚC THÊM MỚI ---

            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
    // --- KẾT THÚC SỬA ĐỔI ---
}