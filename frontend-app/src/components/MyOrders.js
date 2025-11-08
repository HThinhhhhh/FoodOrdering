// src/components/MyOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// --- 1. LẤY API URL TỪ BIẾN MÔI TRƯỜNG ---
const API_URL = process.env.REACT_APP_API_URL;

export const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                // --- 2. SỬA LẠI LỆNH GỌI API (THÊM URL ĐẦY ĐỦ) ---
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                setOrders(response.data);
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng của tôi:", error); // <-- Đây là lỗi bạn thấy trong log
            }
            setLoading(false);
        };

        fetchOrders();
    }, []);

    // (Phần JSX return giữ nguyên)
    if (loading) {
        return <p>Đang tải các đơn hàng của bạn...</p>;
    }
    if (orders.length === 0) {
        return <p>Bạn chưa có đơn hàng nào.</p>;
    }
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
                        <td>${order.totalAmount.toFixed(2)}</td>
                        <td>{new Date(order.orderTime).toLocaleString()}</td>
                        <td>
                            <Link to={`/order-status/${order.id}`}>
                                Theo dõi
                            </Link>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};