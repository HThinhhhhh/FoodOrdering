// src/components/MyOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;

export const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng của tôi:", error);
            }
            setLoading(false);
        };
        fetchOrders();
    }, []);

    // --- BẮT ĐẦU: LOGIC HIỂN THỊ NÚT ĐÁNH GIÁ (Goal 4, 5) ---
    const renderActionLink = (order) => {
        // Kiểm tra 3 ngày (3 * 24 * 60 * 60 * 1000 = 259200000ms)
        const threeDaysAgo = Date.now() - 259200000;
        const isRecent = new Date(order.orderTime).getTime() > threeDaysAgo;

        // 1. Nếu đã hoàn thành VÀ chưa đánh giá VÀ trong 3 ngày
        if (order.status === 'COMPLETED' && !order.isReviewed && isRecent) {
            return (
                <Link to={`/review/${order.id}`} style={{color: 'orange', fontWeight: 'bold'}}>
                    Đánh giá
                </Link>
            );
        }

        // 2. Nếu đã đánh giá
        if (order.isReviewed) {
            return <span style={{color: 'gray'}}>Đã đánh giá</span>;
        }

        // 3. Nếu đơn hàng chưa xong (hoặc quá hạn 3 ngày)
        return (
            <Link to={`/order-status/${order.id}`}>
                Bấm để xem
            </Link>
        );
    };
    // --- KẾT THÚC LOGIC ---

    if (loading) { return <p>Đang tải các đơn hàng của bạn...</p>; }
    if (orders.length === 0) { return <p>Bạn chưa có đơn hàng nào.</p>; }

    return (
        <div style={{ padding: '20px' }}>
            <h3>Đơn hàng của tôi</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                <tr style={{ borderBottom: '2px solid black' }}>
                    <th style={{ textAlign: 'left' }}>Mã Đơn</th>
                    <th style={{ textAlign: 'left' }}>Trạng thái</th>
                    <th style={{ textAlign: 'left' }}>Tổng tiền</th>
                    <th style={{ textAlign: 'left' }}>Thời gian đặt</th>
                    <th style={{ textAlign: 'left' }}>Chi tiết</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #ccc' }}>
                        <td>#{order.id}</td>
                        <td>{order.status}</td>
                        <td>{formatCurrency(order.grandTotal)}</td>
                        <td>{new Date(order.orderTime).toLocaleString()}</td>
                        <td>
                            {/* --- SỬA DÒNG NÀY --- */}
                            {renderActionLink(order)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};