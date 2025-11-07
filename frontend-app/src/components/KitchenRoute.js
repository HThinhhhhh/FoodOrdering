import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const KitchenRoute = ({ children }) => {
    const { currentUser } = useAuth();
    let location = useLocation();

    if (!currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (currentUser.role !== 'KITCHEN') {
        // Nếu không phải Bếp (ví dụ: là DINER)
        return <Navigate to="/" replace />; // Về trang chủ
    }

    return children; // Cho phép truy cập
};