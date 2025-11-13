// src/components/KitchenRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const KitchenRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    let location = useLocation();

    if (loading) {
        return <p>Đang tải...</p>;
    }

    if (!currentUser) {
        return <Navigate to="/restaurant/login" state={{ from: location }} replace />; // SỬA
    }

    if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') {
        return children;
    }

    if (currentUser.role === 'EMPLOYEE') {
        return <Navigate to="/restaurant/admin/orders" state={{ from: location }} replace />; // SỬA
    }

    window.location.href = 'http://localhost:3000';
    return null;
};