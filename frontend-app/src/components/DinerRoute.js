import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const DinerRoute = ({ children }) => {
    const { currentUser } = useAuth();
    let location = useLocation();

    if (!currentUser) {
        // Nếu chưa đăng nhập, điều hướng đến /login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (currentUser.role !== 'DINER') {
        // Nếu đăng nhập nhưng không phải DINER (ví dụ: là KITCHEN)
        return <Navigate to="/" replace />; // Về trang chủ (hoặc trang lỗi)
    }

    return children; // Cho phép truy cập
};