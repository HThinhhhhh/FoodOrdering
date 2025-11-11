// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;
// --- 1. XÁC ĐỊNH CHẾ ĐỘ HIỆN TẠI (CUSTOMER hay KITCHEN) ---
const APP_MODE = process.env.REACT_APP_MODE;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- 2. HÀM TẢI USER (SẼ GỌI ĐÚNG API) ---
    const fetchMe = async () => {
        let meApiUrl = '';
        if (APP_MODE === 'KITCHEN') {
            meApiUrl = `${API_URL}/api/auth/employee/me`;
        } else {
            // Mặc định là Khách hàng (CUSTOMER)
            meApiUrl = `${API_URL}/api/auth/customer/me`;
        }

        try {
            const response = await axios.get(meApiUrl);
            setCurrentUser(response.data);
        } catch (e) {
            setCurrentUser(null);
        }
        setLoading(false);
    };

    // Chạy hàm tải user khi khởi động
    useEffect(() => {
        fetchMe();
    }, []); // Chỉ chạy 1 lần

    // --- HÀM LOGIN CHO KHÁCH (Dùng SĐT) ---
    const customerLogin = async (phoneNumber, password) => {
        try {
            // 1. Tạo Form Data
            const params = new URLSearchParams();
            params.append('phoneNumber', phoneNumber); // (Tên trường phải khớp với SecurityConfig)
            params.append('password', password);

            // 2. Gửi request
            await axios.post(`${API_URL}/api/auth/customer/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // 3. Đăng nhập thành công, gọi lại /me (của Customer)
            const response = await axios.get(`${API_URL}/api/auth/customer/me`);
            setCurrentUser(response.data);
            return response.data;

        } catch (error) {
            console.error("Lỗi đăng nhập Khách:", error);
            setCurrentUser(null);
            throw error;
        }
    };

    // --- HÀM LOGIN CHO BẾP (Dùng Username) ---
    const employeeLogin = async (username, password) => {
        try {
            // 1. Tạo Form Data
            const params = new URLSearchParams();
            params.append('username', username);
            params.append('password', password);

            // 2. Gửi request
            await axios.post(`${API_URL}/api/auth/employee/login`, params, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            // 3. Đăng nhập thành công, gọi /me (của Employee)
            const response = await axios.get(`${API_URL}/api/auth/employee/me`);
            setCurrentUser(response.data);
            return response.data;

        } catch (error) {
            console.error("Lỗi đăng nhập Bếp/Admin:", error);
            setCurrentUser(null);
            throw error;
        }
    };

    // (Đăng ký chỉ dành cho Khách)
    const register = async (phoneNumber, password) => {
        await axios.post(`${API_URL}/api/auth/customer/register`, { phoneNumber, password });
    };

    const logout = async () => {
        try {
            // --- 4. GỌI API LOGOUT TƯƠNG ỨNG ---
            let logoutApiUrl = '';
            if (APP_MODE === 'KITCHEN') {
                logoutApiUrl = `${API_URL}/api/auth/employee/logout`;
            } else {
                logoutApiUrl = `${API_URL}/api/auth/customer/logout`;
            }

            await axios.post(logoutApiUrl);
            setCurrentUser(null);
        } catch (error) {
            console.error("Lỗi đăng xuất:", error);
            setCurrentUser(null);
        }
    };

    const updateUser = (updatedUser) => {
        setCurrentUser(updatedUser);
    };

    const value = {
        currentUser,
        loading,
        customerLogin,
        employeeLogin,
        logout,
        register,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};