// src/components/KitchenRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

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

    if (currentUser.role !== 'KITCHEN' && currentUser.role !== 'ADMIN') {
        // Nếu đăng nhập nhưng là Khách (DINER)
        // Hãy điều hướng họ đến trang Khách (ở Cổng 3000)
        window.location.href = 'http://localhost:3000';
        return null;
    }

    return children; // Cho phép truy cập
};