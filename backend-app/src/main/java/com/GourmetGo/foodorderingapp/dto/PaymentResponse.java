package com.GourmetGo.foodorderingapp.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor // Tạo constructor cho tất cả các trường
public class PaymentResponse {
    private String status;
    private String transactionId;
}