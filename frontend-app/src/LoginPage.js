// src/components/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom'; // 1. Thêm Link

export const LoginPage = () => {
    // --- THAY ĐỔI STATE ---
    const [phoneNumber, setPhoneNumber] = useState(''); // 2. Đổi state
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, currentUser, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && currentUser.role === 'DINER') {
            navigate('/');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // --- 3. GỬI SĐT ---
            const user = await login(phoneNumber, password);

            if (user.role === 'DINER') {
                navigate('/');
            } else {
                setError('Đây không phải tài khoản của khách hàng.');
                await logout();
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại SĐT/mật khẩu.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Đăng nhập Khách hàng</h2>
            <form onSubmit={handleSubmit}>
                {/* --- 4. SỬA GIAO DIỆN --- */}
                <div style={{ marginBottom: '10px' }}>
                    <label>Số điện thoại: </label>
                    <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Mật khẩu: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ marginTop: '20px', padding: '10px 15px' }}>Đăng nhập</button>
            </form>
            {/* 5. THÊM LINK ĐĂNG KÝ */}
            <p>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
};