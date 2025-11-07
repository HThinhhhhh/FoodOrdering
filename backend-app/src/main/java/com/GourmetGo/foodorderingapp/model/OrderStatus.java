package com.GourmetGo.foodorderingapp.model;

/**
 * Các trạng thái của một đơn hàng trong quy trình.
 */
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
    COMPLETED // <-- THÊM DÒNG NÀY
}