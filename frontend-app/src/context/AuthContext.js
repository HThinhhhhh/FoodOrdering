import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get("/api/auth/me")
            .then(response => {
                setCurrentUser(response.data);
                setLoading(false);
            })
            .catch(() => {
                setCurrentUser(null);
                setLoading(false);
            });
    }, []);

    // --- SỬA LOGIC HÀM LOGIN ---
    const login = async (username, password) => {
        try {
            // 1. Gửi JSON (thay vì URLSearchParams)
            const response = await axios.post('/api/auth/login', { username, password });

            // 2. API mới trả về User, gán trực tiếp
            setCurrentUser(response.data);

        } catch (error) {
            console.error("Lỗi đăng nhập:", error);
            throw error;
        }
    };
    // --- KẾT THÚC SỬA HÀM LOGIN ---

    const register = async (username, password) => {
        await axios.post('/api/auth/register', { username, password });
    };

    const logout = async () => {
        await axios.post('/api/auth/logout');
        setCurrentUser(null);
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