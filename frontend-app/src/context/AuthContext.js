// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// --- 1. SỬA LẠI CÁCH LẤY API URL ---
// Giống như cách MenuContext.js làm, lấy URL từ biến môi trường
const API_URL = process.env.REACT_APP_API_URL; // Sẽ là http://localhost:8080

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. Cập nhật hàm này để gọi URL đầy đủ
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

    const login = async (username, password) => {
        try {
            // 3. Cập nhật hàm này để gọi URL đầy đủ
            const response = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            setCurrentUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    };

    const register = async (username, password) => {
        // 4. Cập nhật hàm này để gọi URL đầy đủ
        await axios.post(`${API_URL}/api/auth/register`, { username, password });
    };

    const logout = async () => {
        try {
            // 5. Cập nhật hàm này để gọi URL đầy đủ
            await axios.post(`${API_URL}/api/auth/logout`);
            setCurrentUser(null);
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};