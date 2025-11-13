package com.GourmetGo.foodorderingapp.controller;

import com.GourmetGo.foodorderingapp.dto.RevenueByDateDTO;
import com.GourmetGo.foodorderingapp.dto.RevenueByPaymentMethodDTO;
import com.GourmetGo.foodorderingapp.service.RevenueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/revenue")
public class AdminRevenueController {

    @Autowired
    private RevenueService revenueService;

    @GetMapping("/by-date")
    public ResponseEntity<List<RevenueByDateDTO>> getRevenueByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<RevenueByDateDTO> data = revenueService.getRevenueByDate(startDateTime, endDateTime);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/by-payment-method")
    public ResponseEntity<List<RevenueByPaymentMethodDTO>> getRevenueByPaymentMethod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<RevenueByPaymentMethodDTO> data = revenueService.getRevenueByPaymentMethod(startDateTime, endDateTime);
        return ResponseEntity.ok(data);
    }
}