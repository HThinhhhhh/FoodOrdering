// src/components/KitchenLoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const KitchenLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    // --- 1. SỬA: LẤY ĐÚNG HÀM ---
    const { employeeLogin, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser && (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN')) {
            navigate('/kitchen');
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // --- 2. SỬA: GỌI ĐÚNG HÀM ---
            const user = await employeeLogin(username, password);

            if (user.role === 'KITCHEN' || user.role === 'ADMIN') {
                navigate('/kitchen');
            } else {
                setError('Đây không phải tài khoản của nhân viên/admin.');
            }
        } catch (err) {
            setError('Đăng nhập thất bại.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Đăng nhập Bếp / Admin</h2>
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