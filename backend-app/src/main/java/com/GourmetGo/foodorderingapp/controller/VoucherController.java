package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.ApplyVoucherRequest;
import com.GourmetGo.foodorderingapp.dto.ApplyVoucherResponse;
import com.GourmetGo.foodorderingapp.model.Voucher;
import com.GourmetGo.foodorderingapp.repository.VoucherRepository;
import com.GourmetGo.foodorderingapp.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/vouchers")
public class VoucherController {

    @Autowired
    private VoucherService voucherService;

    @Autowired
    private VoucherRepository voucherRepository; // Dùng tạm để lấy description

    @PostMapping("/apply")
    public ResponseEntity<?> applyVoucher(@RequestBody ApplyVoucherRequest request) {
        try {
            BigDecimal discountAmount = voucherService.applyVoucher(
                    request.getCode(),
                    request.getSubtotal()
            );

            // Lấy mô tả (description) để hiển thị cho khách
            Voucher voucher = voucherRepository.findByCode(request.getCode().toUpperCase()).get();

            return ResponseEntity.ok(new ApplyVoucherResponse(
                    voucher.getCode(),
                    discountAmount,
                    voucher.getDescription()
            ));
        } catch (IllegalStateException e) {
            // Lỗi nghiệp vụ (hết hạn, sai code, chưa đủ...)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi hệ thống.");
        }
    }
}