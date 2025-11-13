import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

// --- 1. IMPORT CSS MODULE ---
import styles from './AdminForm.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- 2. XÓA 'const styles = { ... }' ---
// (Đã xóa)

export const OrderEditPage = () => {
    // (State và logic (useEffect, handleSubmit) giữ nguyên)
    // ...
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [shipperNote, setShipperNote] = useState('');

    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/api/admin/orders`)
            .then(response => {
                const orderToEdit = response.data.find(o => o.id.toString() === id);
                if (orderToEdit) {
                    if (orderToEdit.status !== 'PENDING_CONFIRMATION') {
                        setError('Không thể sửa đơn hàng đã được xác nhận.');
                    }
                    setOrder(orderToEdit);
                    setDeliveryAddress(orderToEdit.deliveryAddress);
                    setShipperNote(orderToEdit.shipperNote || '');
                } else {
                    setError('Không tìm thấy đơn hàng.');
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Lỗi tải dữ liệu đơn hàng.');
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                deliveryAddress,
                shipperNote
            };
            await axios.put(`${API_URL}/api/admin/orders/${id}/details`, payload);
            alert('Cập nhật chi tiết đơn hàng thành công!');
            navigate('/restaurant/admin/orders');
        } catch (err) {
            setError(err.response?.data || 'Lỗi khi cập nhật.');
            setLoading(false);
        }
    };
    // ...

    if (loading) return <p>Đang tải chi tiết đơn hàng...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!order) return null;

    return (
        // --- 3. SỬ DỤNG className ---
        // (Sử dụng .formContainer thay vì .container)
        <div className={styles.formContainer}>
            <h2>Sửa chi tiết Đơn hàng #{order.id}</h2>
            <p>Bạn chỉ có thể sửa khi đơn hàng ở trạng thái "PENDING_CONFIRMATION".</p>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Địa chỉ giao hàng:</label>
                    <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Ghi chú của Khách cho Tài xế:</label>
                    <textarea
                        value={shipperNote}
                        onChange={(e) => setShipperNote(e.target.value)}
                        className={styles.textarea}
                    />
                </div>

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>
        </div>
    );
};