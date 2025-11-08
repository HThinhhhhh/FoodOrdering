// src/components/KitchenRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const KitchenRoute = ({ children }) => {
    const { currentUser } = useAuth();
    let location = useLocation();

    if (!currentUser) {
        // Nếu chưa đăng nhập, điều hướng đến /kitchen/login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // --- SỬA LỖI VÒNG LẶP ---
    if (currentUser.role !== 'KITCHEN') {
        // Nếu đăng nhập nhưng là Khách (DINER)
        // Hãy điều hướng họ đến trang Khách (ở Cổng 3000)
        window.location.href = 'http://localhost:3000';
        return null;
    }
    // --- KẾT THÚC SỬA ---

    return children; // Cho phép truy cập
};