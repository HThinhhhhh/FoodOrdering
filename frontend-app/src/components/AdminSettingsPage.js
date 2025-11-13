import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- IMPORT CSS MODULE MỚI ---
import styles from './AdminSettingsPage.module.css';

const API_URL = process.env.REACT_APP_API_URL;

export const AdminSettingsPage = () => {
    const [formData, setFormData] = useState({
        restaurantName: '',
        coverImageUrl: '',
        address: '',
        openingHours: '',
        contactPhone: '',
        contactEmail: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // 1. Tải cài đặt hiện tại khi vào trang
    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/api/settings`)
            .then(response => {
                setFormData(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError('Không thể tải cài đặt.');
                setLoading(false);
            });
    }, []);

    // 2. Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 3. Gửi cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.put(`${API_URL}/api/admin/settings`, formData);
            setSuccess('Cập nhật thông tin nhà hàng thành công!');
            // (Không cần reload, state đã cập nhật)
        } catch (err) {
            setError('Lỗi khi cập nhật: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.restaurantName) {
        return <p>Đang tải cài đặt...</p>;
    }

    return (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            <h2>Cài đặt Thông tin Nhà hàng</h2>

            <div className={styles.formGroup}>
                <label className={styles.label}>Tên Nhà hàng:</label>
                <input
                    type="text"
                    name="restaurantName"
                    value={formData.restaurantName || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Tên thương hiệu của bạn"
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>URL Ảnh bìa/Logo:</label>
                <input
                    type="text"
                    name="coverImageUrl"
                    value={formData.coverImageUrl || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="https://i.imgur.com/your-logo.png"
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Địa chỉ:</label>
                <textarea
                    name="address"
                    value={formData.address || ''}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="123 Đường ABC, Phường X, Quận Y, TP. Z"
                />
            </div>

            <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Giờ mở cửa:</label>
                    <input
                        type="text"
                        name="openingHours"
                        value={formData.openingHours || ''}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Thứ 2 - CN: 08:00 - 22:00"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>SĐT Liên hệ (Hotline):</label>
                    <input
                        type="text"
                        name="contactPhone"
                        value={formData.contactPhone || ''}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="090xxxxxxx"
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label}>Email Liên hệ:</label>
                <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ''}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="example@gmail.com"
                />
            </div>

            {error && <p className={styles.errorText}>{error}</p>}
            {success && <p className={styles.successText}>{success}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
                {loading ? 'Đang lưu...' : 'Lưu Cài đặt'}
            </button>
        </form>
    );
};