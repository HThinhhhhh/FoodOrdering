package com.GourmetGo.foodorderingapp.model;

/**
 * Vai trò của Nhân viên (Employee)
 * (Vai trò DINER được gán cứng cho Customer)
 */
public enum Role {
    KITCHEN, // Nhân viên bếp (chỉ thấy KDS)
    EMPLOYEE, // Nhân viên (quản lý đơn hàng)
    ADMIN     // Quản trị viên (quản lý đơn + quản lý menu)
}