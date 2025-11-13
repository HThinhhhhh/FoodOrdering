package com.GourmetGo.foodorderingapp.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.GourmetGo.foodorderingapp.dto.OrderItemRequest;
import com.GourmetGo.foodorderingapp.dto.OrderRequest;
import com.GourmetGo.foodorderingapp.model.*;
import com.GourmetGo.foodorderingapp.repository.CustomerRepository;
import com.GourmetGo.foodorderingapp.repository.MenuItemRepository;
import com.GourmetGo.foodorderingapp.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OrderBatchProcessor {

    private static final Logger log = LoggerFactory.getLogger(OrderBatchProcessor.class);
    private static final String ORDER_QUEUE_KEY = "order_queue";

    @Autowired private RedisTemplate<String, String> redisTemplate;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MenuItemRepository menuItemRepository;
    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private VoucherService voucherService; // <-- THÊM MỚI

    private ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        objectMapper.registerModule(new JavaTimeModule());
    }

    @Scheduled(fixedRate = 1000)
    @Transactional
    public void processOrderQueue() {
        log.info("Đang kiểm tra hàng đợi đơn hàng...");
        List<String> orderJsonList = redisTemplate.opsForList().range(ORDER_QUEUE_KEY, 0, -1);
        if (orderJsonList == null || orderJsonList.isEmpty()) { log.info("Hàng đợi trống, không có gì để xử lý."); return; }

        List<Order> ordersToSave = new ArrayList<>();
        long processedCount = 0;

        for (String orderJson : orderJsonList) {
            processedCount++;
            try {
                OrderRequest request = objectMapper.readValue(orderJson, OrderRequest.class);
                Order order = transformRequestToOrder(request);
                ordersToSave.add(order);
            } catch (Exception e) {
                log.error("Lỗi xử lý đơn hàng JSON (sẽ bị xóa khỏi queue): {}. Lỗi: {}", orderJson, e.getMessage());
            }
        }

        if (!ordersToSave.isEmpty()) {
            List<Order> savedOrders = orderRepository.saveAll(ordersToSave);
            log.info("Đã lưu thành công {} đơn hàng vào CSDL.", savedOrders.size());

            for (Order savedOrder : savedOrders) {
                Map<String, Object> orderDto = convertOrderToDto(savedOrder);

                // Gửi cho Admin/Employee
                log.info("Đang gửi đơn hàng DTO tới /topic/admin/order-updates: {}", orderDto);
                messagingTemplate.convertAndSend("/topic/admin/order-updates", orderDto);

                // Tăng lượt sử dụng voucher (nếu có)
                if (savedOrder.getVoucherCode() != null && !savedOrder.getVoucherCode().isBlank()) {
                    try {
                        voucherService.incrementVoucherUsage(savedOrder.getVoucherCode());
                        log.info("Đã tăng lượt sử dụng cho voucher: {}", savedOrder.getVoucherCode());
                    } catch (Exception e) {
                        log.error("Lỗi khi tăng lượt sử dụng voucher {}: {}", savedOrder.getVoucherCode(), e.getMessage());
                    }
                }
            }
        }

        if (processedCount > 0) {
            redisTemplate.opsForList().trim(ORDER_QUEUE_KEY, processedCount, -1);
            log.info("Đã xóa {} đơn hàng đã xử lý khỏi queue.", processedCount);
        }
    }

    private Order transformRequestToOrder(OrderRequest request) {
        // (Tìm Customer, tạo Order, gán thông tin Order (Status, Address, Voucher...) giữ nguyên)
        Customer customer = customerRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Customer ID: " + request.getUserId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus(OrderStatus.PENDING_CONFIRMATION);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setShipperNote(request.getShipperNote());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setSubtotal(request.getSubtotal());
        order.setVatAmount(request.getVatAmount());
        order.setShippingFee(request.getShippingFee());
        order.setPickupWindow(request.getPickupWindow());
        order.setGrandTotal(request.getGrandTotal());
        order.setVoucherCode(request.getVoucherCode());
        order.setDiscountAmount(request.getDiscountAmount());

        Set<OrderItem> orderItems = new HashSet<>();
        for (OrderItemRequest itemRequest : request.getItems()) {
            MenuItem menuItem = menuItemRepository.findById(itemRequest.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy MenuItem ID: " + itemRequest.getMenuItemId()));

            // (Kiểm tra MenuItemStatus giữ nguyên)
            if (menuItem.getStatus() != MenuItemStatus.ON_SALE) { /* ... */ }

            OrderItem orderItem = new OrderItem();
            orderItem.setMenuItem(menuItem);
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setOrder(order);
            orderItem.setNote(itemRequest.getNote());

            // --- THÊM LOGIC MỚI: LƯU OPTIONS VÀ GIÁ ---
            // (Chúng ta tin tưởng giá đã được tính toán ở frontend)
            orderItem.setPricePerUnit(itemRequest.getPricePerUnit());
            orderItem.setSelectedOptionsText(itemRequest.getSelectedOptionsText());
            // --- KẾT THÚC THÊM MỚI ---

            orderItems.add(orderItem);
        }

        order.setItems(orderItems);
        return order;
    }

    private Map<String, Object> convertOrderToDto(Order order) {
        Map<String, Object> orderDto = new HashMap<>();
        // ... (Gán các trường id, status, customerName, phone, notes, voucher... giữ nguyên)
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

            // --- THÊM MỚI: Gửi thông tin tùy chọn cho KDS/Admin ---
            itemMap.put("pricePerUnit", item.getPricePerUnit());
            itemMap.put("selectedOptionsText", item.getSelectedOptionsText());
            // --- KẾT THÚC THÊM MỚI ---

            return itemMap;
        }).collect(Collectors.toList());

        orderDto.put("items", itemDtos);
        return orderDto;
    }
}