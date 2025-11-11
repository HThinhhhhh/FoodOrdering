// src/components/DinerRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const DinerRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    let location = useLocation();

    if (loading) {
        return <p>Đang tải...</p>; // Hiển thị loading trong khi chờ /me
    }

    if (!currentUser) {
        // Nếu chưa đăng nhập, điều hướng đến /login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (currentUser.role !== 'DINER') {
        // Nếu đăng nhập nhưng là Bếp (KITCHEN)
        // Hãy điều hướng họ đến trang Bếp (ở Cổng 3001)
        window.location.href = 'http://localhost:3001/kitchen';
        return null;
    }

    return children; // Cho phép truy cập
};