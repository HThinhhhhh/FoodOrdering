// src/components/RegisterPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// --- 1. IMPORT CSS MODULE ---
import styles from './Form.module.css';

export const RegisterPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu không khớp!');
            return;
        }

        try {
            await register(phoneNumber, password);
            alert('Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setError('Số điện thoại này đã tồn tại.');
            } else {
                setError('Đã xảy ra lỗi khi đăng ký.');
            }
        }
    };

    return (
        // --- 2. SỬ DỤNG className ---
        <div className={styles.formContainer}>
            <h2>Đăng ký tài khoản Khách hàng</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số điện thoại: </label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Xác nhận Mật khẩu: </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={styles.formInput}
                    />
                </div>
                {error && <p className={styles.formError}>{error}</p>}
                <button type="submit" className={styles.formButton}>Đăng ký</button>
            </form>
            <p className={styles.formLink}>
                Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
        </div>
    );
};