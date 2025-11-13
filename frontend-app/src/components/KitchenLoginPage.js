// src/components/KitchenLoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const KitchenLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { employeeLogin, currentUser } = useAuth();
    const navigate = useNavigate();

    // Sửa điều hướng (useEffect)
    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') {
                navigate('/restaurant'); // SỬA
            } else if (currentUser.role === 'EMPLOYEE') {
                navigate('/restaurant/admin/orders'); // SỬA
            }
        }
    }, [currentUser, navigate]);

    // Sửa điều hướng (handleSubmit)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await employeeLogin(username, password);

            if (user.role === 'KITCHEN' || user.role === 'ADMIN') {
                navigate('/restaurant'); // SỬA
            } else if (user.role === 'EMPLOYEE') {
                navigate('/restaurant/admin/orders'); // SỬA
            } else {
                setError('Đây không phải tài khoản của nhân viên/admin.');
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h2>Đăng nhập Bếp / Admin / NV</h2>
            {/* (Form giữ nguyên) */}
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