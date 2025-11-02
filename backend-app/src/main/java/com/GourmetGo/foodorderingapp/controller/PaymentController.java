package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.PaymentResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    /**
     * Giả lập một API thanh toán thành công.
     */
    @PostMapping("/mock")
    public PaymentResponse mockPayment() {
        // Tạo một ID giao dịch giả ngẫu nhiên
        String mockTransactionId = "mock_" + UUID.randomUUID().toString();

        return new PaymentResponse("SUCCESS", mockTransactionId);
    }
}