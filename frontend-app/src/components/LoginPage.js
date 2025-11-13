import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// --- 1. IMPORT CSS MODULE ---
import styles from './Form.module.css';

export const LoginPage = () => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { customerLogin, currentUser } = useAuth();
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
            const user = await customerLogin(phoneNumber, password);

            if (user.role === 'DINER') {
                navigate('/');
            } else {
                setError('Đây không phải tài khoản của khách hàng.');
            }
        } catch (err) {
            setError('Đăng nhập thất bại. Vui lòng kiểm tra lại SĐT/mật khẩu.');
        }
    };

    return (
        // --- 2. SỬ DỤNG className ---
        <div className={styles.formContainer}>
            <h2>Đăng nhập Khách hàng</h2>
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
                {error && <p className={styles.formError}>{error}</p>}
                <button type="submit" className={styles.formButton}>Đăng nhập</button>
            </form>
            <p className={styles.formLink}>
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
};