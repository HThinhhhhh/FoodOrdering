package com.GourmetGo.foodorderingapp.model;

public enum OrderStatus {
    /**
     * Đã nhận đơn, chờ bếp xác nhận.
     */
    RECEIVED,

    /**
     * Bếp đang chuẩn bị món.
     */
    PREPARING,

    /**
     * Món đã sẵn sàng để lấy.
     */
    READY,

    /**
     * Khách đã lấy hàng (hoàn thành)
     */
    COMPLETED,

    /**
     * Đơn hàng đã bị hủy (bởi bếp)
     */
    CANCELLED
}