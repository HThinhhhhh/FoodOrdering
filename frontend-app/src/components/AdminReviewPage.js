import React, { useState, useEffect } from 'react';
import axios from 'axios';
// (Bạn có thể cần import 'formatCurrency' nếu chưa có, nhưng có vẻ không cần ở đây)

const API_URL = process.env.REACT_APP_API_URL;

// (CSS)
const styles = {
    container: { padding: '20px' },
    tabs: { marginBottom: '20px', borderBottom: '2px solid #ccc' },
    tabButton: { padding: '10px 15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1.1em' },
    activeTab: { borderBottom: '3px solid blue', fontWeight: 'bold' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { background: '#f4f4f4', padding: '8px', border: '1px solid #ddd', textAlign: 'left' },
    td: { padding: '8px', border: '1px solid #ddd', verticalAlign: 'top' },
    rating: { color: 'gold', fontWeight: 'bold' }
};

// Component Star (chỉ hiển thị)
const Stars = ({ rating }) => (
    <span style={styles.rating}>
        {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
);

export const AdminReviewPage = () => {
    const [view, setView] = useState('food'); // 'food' hoặc 'delivery'
    const [loading, setLoading] = useState(true);
    const [foodReviews, setFoodReviews] = useState([]);
    const [deliveryReviews, setDeliveryReviews] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (view === 'food') {
                    // (API này đã được sửa ở backend để trả về DTO)
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
    }, [view]); // Tải lại khi 'view' thay đổi

    return (
        <div style={styles.container}>
            <h2>Quản lý Đánh giá & Phản hồi</h2>

            <div style={styles.tabs}>
                <button
                    style={{...styles.tabButton, ...(view === 'food' ? styles.activeTab : {})}}
                    onClick={() => setView('food')}>
                    Đánh giá Món ăn
                </button>
                <button
                    style={{...styles.tabButton, ...(view === 'delivery' ? styles.activeTab : {})}}
                    onClick={() => setView('delivery')}>
                    Đánh giá Giao hàng
                </button>
            </div>

            {loading && <p>Đang tải...</p>}

            {/* Bảng Đánh giá Món ăn */}
            {view === 'food' && (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>Món ăn</th>
                        <th style={styles.th}>Đánh giá</th>
                        {/* --- SỬA LỖI CÚ PHÁP TẠI ĐÂY --- */}
                        <th style={styles.th}>Bình luận</th>
                        {/* --- KẾT THÚC SỬA LỖI --- */}
                        <th style={styles.th}>Người gửi (SĐT)</th>
                        <th style={styles.th}>Mã Đơn</th>
                    </tr>
                    </thead>
                    <tbody>
                    {foodReviews.map(review => (
                        <tr key={review.id}>
                            <td style={styles.td}>{review.menuItemName}</td>
                            <td style={styles.td}><Stars rating={review.rating} /></td>
                            <td style={styles.td}>{review.comment}</td>
                            <td style={styles.td}>{review.customerPhone} (ID: {review.customerId})</td>
                            <td style={styles.td}>#{review.orderId}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {/* Bảng Đánh giá Giao hàng */}
            {view === 'delivery' && (
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>Mã Đơn</th>
                        <th style={styles.th}>Đánh giá</th>
                        {/* --- SỬA LỖI CÚ PHÁP TẠI ĐÂY --- */}
                        <th style={styles.th}>Bình luận</th>
                        {/* --- KẾT THÚC SỬA LỖI --- */}
                        <th style={styles.th}>Người gửi (SĐT)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {deliveryReviews.map(order => (
                        <tr key={order.id}>
                            <td style={styles.td}>#{order.id}</td>
                            <td style={styles.td}><Stars rating={order.deliveryRating} /></td>
                            <td style={styles.td}>{order.deliveryComment}</td>
                            {/* (Dùng customerPhone vì DTO của Order đã được cập nhật) */}
                            <td style={styles.td}>{order.customerPhone} (ID: {order.userId})</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};