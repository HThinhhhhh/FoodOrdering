import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// --- 1. IMPORT CSS MODULE ---
import styles from './Form.module.css';

const API_URL = process.env.REACT_APP_API_URL;

export const ChangePasswordPage = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        // ... (logic handleSubmit giữ nguyên)
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới không khớp.');
            return;
        }

        if (newPassword.length < 3) {
            setError('Mật khẩu mới phải có ít nhất 3 ký tự.');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/auth/customer/change-password`, {
                currentPassword,
                newPassword
            });
            setSuccess('Đổi mật khẩu thành công! Bạn sẽ được chuyển về trang "Đơn hàng của tôi" sau 2 giây.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => navigate('/my-orders'), 2000);
        } catch (err) {
            if (err.response && (err.response.status === 401 || err.response.status === 400)) {
                setError(err.response.data);
            } else if (err.response && err.response.status === 403) {
                setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
            } else {
                setError('Đã xảy ra lỗi, vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        // --- 2. SỬ DỤNG className ---
        <div className={styles.formContainer}>
            <h2>Đổi mật khẩu</h2>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mật khẩu hiện tại:</label>
                    <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mật khẩu mới:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className={styles.formInput}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Xác nhận mật khẩu mới:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={styles.formInput}
                    />
                </div>

                {error && <p className={styles.formError}>{error}</p>}
                {success && <p className={styles.formSuccess}>{success}</p>}

                <button type="submit" disabled={loading} className={styles.formButton}>
                    {loading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                </button>
            </form>
        </div>
    );
};