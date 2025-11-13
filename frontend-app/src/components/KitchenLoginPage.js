// src/components/KitchenLoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- 1. IMPORT CSS MODULE ---
import styles from './Form.module.css';

export const KitchenLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { employeeLogin, currentUser } = useAuth();
    const navigate = useNavigate();

    // (logic useEffect và handleSubmit giữ nguyên)
    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'KITCHEN' || currentUser.role === 'ADMIN') {
                navigate('/restaurant');
            } else if (currentUser.role === 'EMPLOYEE') {
                navigate('/restaurant/admin/orders');
            }
        }
    }, [currentUser, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const user = await employeeLogin(username, password);

            if (user.role === 'KITCHEN' || user.role === 'ADMIN') {
                navigate('/restaurant');
            } else if (user.role === 'EMPLOYEE') {
                navigate('/restaurant/admin/orders');
            } else {
                setError('Đây không phải tài khoản của nhân viên/admin.');
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu.');
        }
    };

    return (
        // --- 2. SỬ DỤNG className ---
        <div className={styles.formContainer}>
            <h2>Đăng nhập Bếp / Admin / NV</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Username: </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mật khẩu: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                {error && <p className={styles.formError}>{error}</p>}
                <button type="submit" className={styles.formButton}>Đăng nhập</button>
            </form>
        </div>
    );
};