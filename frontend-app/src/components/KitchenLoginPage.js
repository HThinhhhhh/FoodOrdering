// src/components/KitchenLoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const KitchenLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // --- SỬA ĐỔI 1: Lấy đúng hàm ---
    const { employeeLogin, currentUser } = useAuth();
    const navigate = useNavigate();

    // Điều hướng nếu đã đăng nhập
    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') {
                navigate('/kitchen');
            } else if (currentUser.role === 'EMPLOYEE') {
                navigate('/kitchen/admin/orders');
            }
        }
    }, [currentUser, navigate]);

    // --- SỬA ĐỔI 2: Logic điều hướng sau khi đăng nhập ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await employeeLogin(username, password);

            // Phân luồng dựa trên vai trò
            if (user.role === 'KITCHEN' || user.role === 'ADMIN') {
                navigate('/kitchen'); // Tới KDS
            } else if (user.role === 'EMPLOYEE') {
                navigate('/kitchen/admin/orders'); // Tới Trang Quản lý Đơn hàng
            } else {
                // (Dành cho vai trò DINER nếu họ vô tình đăng nhập nhầm)
                setError('Đây không phải tài khoản của nhân viên/admin.');
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.');
        }
    };
    // --- KẾT THÚC SỬA ĐỔI ---

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Đăng nhập Bếp / Admin / NV</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Username: </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Mật khẩu: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px' }} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ marginTop: '20px', padding: '10px 15px' }}>Đăng nhập</button>
            </form>
        </div>
    );
};