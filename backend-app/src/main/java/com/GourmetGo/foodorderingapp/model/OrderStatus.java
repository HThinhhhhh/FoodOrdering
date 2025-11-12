package com.GourmetGo.foodorderingapp.model;

public enum OrderStatus {
    /**
     * MỚI: Đơn hàng vừa vào hệ thống, chờ Admin/Nhân viên xác nhận
     */
    PENDING_CONFIRMATION,

    /**
     * Đã nhận đơn, Bếp thấy và bắt đầu làm.
     */
    RECEIVED,

    /**
     * Bếp đang chuẩn bị món.
     */
    PREPARING,

    /**
     * Món đã sẵn sàng để lấy/giao.
     */
    READY,

    /**
     * MỚI: Đơn hàng đang trên đường giao
     */
    DELIVERING,

    /**
     * Khách đã lấy hàng (hoàn thành)
     */
    COMPLETED,

    /**
     * Đơn hàng đã bị hủy (bởi bếp hoặc admin)
     */
    CANCELLED
}