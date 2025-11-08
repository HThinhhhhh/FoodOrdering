// src/components/KitchenLoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const KitchenLoginPage = () => {
    // --- THAY ĐỔI STATE ---
    const [phoneNumber, setPhoneNumber] = useState(''); // 1. Đổi state
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.role === 'KITCHEN') {
            navigate('/kitchen');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // --- 2. GỬI SĐT ---
            const user = await login(phoneNumber, password);

            if (user.role === 'KITCHEN') {
                navigate('/kitchen');
            } else {
                setError('Đây không phải tài khoản của nhân viên bếp.');
                await logout();
            }
        } catch (err) {
            setError('Đăng nhập thất bại.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Đăng nhập Màn hình Bếp (KDS)</h2>
            <form onSubmit={handleSubmit}>
                {/* --- 3. SỬA GIAO DIỆN --- */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Số điện thoại: </label>
                    <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Mật khẩu: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ marginTop: '20px', padding: '10px 15px' }}>Đăng nhập Bếp</button>
            </form>
        </div>
    );
};