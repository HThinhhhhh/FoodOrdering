import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/'); // Đăng nhập thành công, về trang chủ
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại username/password.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Đăng nhập</h2>
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
                <button type="submit" style={{ marginTop: '10px' }}>Đăng nhập</button>
            </form>
            {/* (Bạn có thể thêm link đến trang Đăng ký ở đây) */}
        </div>
    );
};