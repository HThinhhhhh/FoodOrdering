// src/components/AdminRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route này BẢO VỆ các trang Admin (Quản lý Menu, Quản lý Đơn hàng).
 * Cho phép ADMIN và EMPLOYEE.
 */
export const AdminRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    let location = useLocation();

    if (loading) {
        return <p>Đang tải...</p>;
    }

    // 1. Phải đăng nhập
    if (!currentUser) {
        return <Navigate to="/kitchen/login" state={{ from: location }} replace />;
    }

    // --- SỬA ĐỔI LOGIC ---
    // 2. Phải là ADMIN hoặc EMPLOYEE
    if (currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE') {
        return children; // Cho phép truy cập
    }

    // 3. Nếu là Bếp (KITCHEN) -> Chuyển hướng về KDS
    if (currentUser.role === 'KITCHEN') {
        return <Navigate to="/kitchen" state={{ from: location }} replace />;
    }

    // 4. Nếu là Khách (DINER) -> Đá về trang khách
    window.location.href = 'http://localhost:3000';
    return null;
    // --- KẾT THÚC SỬA ĐỔI ---
};