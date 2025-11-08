// src/components/KitchenLoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const KitchenLoginPage = () => {
    const [username, setUsername] = useState('');
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
            const user = await login(username, password);
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
        // (JSX cho form đăng nhập)
        <div style={{ padding: '20px' }}>
            <h2>Đăng nhập Màn hình Bếp (KDS)</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username: </label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <label>Password: </label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" style={{ marginTop: '10px' }}>Đăng nhập Bếp</button>
            </form>
        </div>
    );
};