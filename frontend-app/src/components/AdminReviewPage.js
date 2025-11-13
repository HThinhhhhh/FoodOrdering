import React, { useState, useEffect } from 'react';
import axios from 'axios';

// --- 1. IMPORT CSS MODULE ---
import styles from './Table.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- 2. XÓA 'const styles = { ... }' ---
// (Đã xóa)

// Component Star (chỉ hiển thị)
const Stars = ({ rating }) => (
    <span className={styles.rating}>
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
);

export const AdminReviewPage = () => {
    // (State và logic (fetchData) giữ nguyên)
    // ...
    const [view, setView] = useState('food'); // 'food' hoặc 'delivery'
    const [loading, setLoading] = useState(true);
    const [foodReviews, setFoodReviews] = useState([]);
    const [deliveryReviews, setDeliveryReviews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === 'food') {
                    const res = await axios.get(`${API_URL}/api/admin/reviews/food`);
                    setFoodReviews(res.data);
                } else {
                    const res = await axios.get(`${API_URL}/api/admin/reviews/delivery`);
                    setDeliveryReviews(res.data);
                }
            } catch (err) {
                console.error("Lỗi tải đánh giá:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, [view]);
    // ...

    return (
        // --- 3. SỬ DỤNG className ---
        <div className={styles.container}>
            <h2>Quản lý Đánh giá & Phản hồi</h2>

            <div className={styles.tabs}>
                <button
                    className={`${styles.tabButton} ${view === 'food' ? styles.activeTab : ''}`}
                    onClick={() => setView('food')}>
                    Đánh giá Món ăn
                </button>
                <button
                    className={`${styles.tabButton} ${view === 'delivery' ? styles.activeTab : ''}`}
                    onClick={() => setView('delivery')}>
                    Đánh giá Giao hàng
                </button>
            </div>

            {loading && <p>Đang tải...</p>}

            {/* Bảng Đánh giá Món ăn */}
            {view === 'food' && (
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Món ăn</th>
                        <th>Đánh giá</th>
                        <th>Bình luận</th>
                        <th>Người gửi (SĐT)</th>
                        <th>Mã Đơn</th>
                    </tr>
                    </thead>
                    <tbody>
                    {foodReviews.map(review => (
                        <tr key={review.id}>
                            <td>{review.menuItemName}</td>
                            <td><Stars rating={review.rating} /></td>
                            <td>{review.comment}</td>
                            <td>{review.customerPhone} (ID: {review.customerId})</td>
                            <td>#{review.orderId}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Bảng Đánh giá Giao hàng */}
            {view === 'delivery' && (
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Mã Đơn</th>
                        <th>Đánh giá</th>
                        <th>Bình luận</th>
                        <th>Người gửi (SĐT)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {deliveryReviews.map(order => (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td><Stars rating={order.deliveryRating} /></td>
                            <td>{order.deliveryComment}</td>
                            <td>{order.customerPhone} (ID: {order.userId})</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};