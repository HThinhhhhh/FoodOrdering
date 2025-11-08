// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/api/auth/me`)
            .then(response => {
                setCurrentUser(response.data);
                setLoading(false);
            })
            .catch(() => {
                setCurrentUser(null);
                setLoading(false);
            });
    }, []);

    // --- SỬA HÀM LOGIN ---
    const login = async (phoneNumber, password) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, { phoneNumber, password });
            setCurrentUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    };
    // --- KẾT THÚC SỬA ---

    // --- SỬA HÀM REGISTER ---
    const register = async (phoneNumber, password) => {
        await axios.post(`${API_URL}/api/auth/register`, { phoneNumber, password });
    };
    // --- KẾT THÚC SỬA ---

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`);
            setCurrentUser(null);
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };

    // --- THÊM HÀM MỚI (Goal 3) ---
    // Cho phép các component cập nhật state của user (ví dụ: sau khi thêm tên)
    const updateUser = (updatedUser) => {
        setCurrentUser(updatedUser);
    };
    // --- KẾT THÚC THÊM HÀM MỚI ---

    const value = {
        currentUser,
        loading,
        login,
        logout,
        register,
        updateUser // Thêm hàm này
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};