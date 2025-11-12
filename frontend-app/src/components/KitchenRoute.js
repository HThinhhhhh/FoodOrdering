// src/components/KitchenRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route này CHỈ BẢO VỆ Màn hình Bếp (KDS).
 * Chỉ cho phép KITCHEN và ADMIN.
 */
export const KitchenRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    let location = useLocation();

    if (loading) {
        return <p>Đang tải...</p>; // Hiển thị loading trong khi chờ /me
    }

    if (!currentUser) {
        // Nếu chưa đăng nhập, điều hướng đến /kitchen/login
        return <Navigate to="/kitchen/login" state={{ from: location }} replace />;
    }

    // --- SỬA ĐỔI LOGIC ---
    // 1. Nếu là Bếp hoặc Admin -> OK
    if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') {
        return children; // Cho phép truy cập KDS
    }

    // 2. Nếu là Nhân viên (EMPLOYEE) -> Chuyển hướng
    if (currentUser.role === 'EMPLOYEE') {
        return <Navigate to="/kitchen/admin/orders" state={{ from: location }} replace />;
    }

    // 3. Nếu là Khách (DINER) -> Đá về trang khách
    window.location.href = 'http://localhost:3000';
    return null;
    // --- KẾT THÚC SỬA ĐỔI ---
};