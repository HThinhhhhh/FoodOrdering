package com.GourmetGo.foodorderingapp.model;

public enum Role {
    KITCHEN, // Nhân viên bếp (chỉ thấy KDS)
    EMPLOYEE, // Nhân viên (quản lý đơn hàng)
    ADMIN     // Quản trị viên (quản lý đơn + quản lý menu)
}