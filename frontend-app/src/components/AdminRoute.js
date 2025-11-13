// src/components/AdminRoute.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const AdminRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    let location = useLocation();

    if (loading) {
        return <p>Đang tải...</p>;
    }

    if (!currentUser) {
        return <Navigate to="/restaurant/login" state={{ from: location }} replace />; // SỬA
    }

    if (currentUser.role === 'ADMIN' || currentUser.role === 'EMPLOYEE') {
        return children;
    }

    if (currentUser.role === 'KITCHEN') {
        return <Navigate to="/restaurant" state={{ from: location }} replace />; // SỬA
    }

    window.location.href = 'http://localhost:3000';
    return null;
};