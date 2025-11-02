package com.GourmetGo.foodorderingapp.dto;

import com.GourmetGo.foodorderingapp.model.OrderStatus;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO đại diện cho yêu cầu cập nhật trạng thái
 * gửi từ client (ví dụ: màn hình Bếp - KDS).
 */
@Getter
@Setter
public class UpdateStatusRequest {

    /** ID của đơn hàng cần cập nhật */
    private Long orderId;

    /** Trạng thái mới (PREPARING, READY, etc.) */
    private OrderStatus newStatus;
}