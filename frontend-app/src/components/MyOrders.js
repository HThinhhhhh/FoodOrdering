// src/components/MyOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useMenu } from '../context/MenuContext';

// --- 1. IMPORT CSS MODULE ---
import styles from './MyOrders.module.css';

const API_URL = process.env.REACT_APP_API_URL;

export const MyOrders = () => {
    // (State và logic (fetchOrders, handleReOrder) giữ nguyên)
    // ...
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { loadCartFromReorder } = useCart();
    const { menuItems } = useMenu();

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

    const handleReOrder = async (orderId) => {
        const confirmed = window.confirm(
            "Đặt lại đơn hàng sẽ XÓA giỏ hàng hiện tại của bạn. Bạn có muốn tiếp tục?"
        );
        if (!confirmed) {
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/orders/${orderId}/reorder`);
            const reorderItems = response.data;

            if (reorderItems && reorderItems.length > 0) {
                loadCartFromReorder(reorderItems, menuItems);
                alert("Đã thêm các món từ đơn hàng cũ vào giỏ hàng!");
                navigate('/');
            } else {
                alert("Không thể đặt lại đơn hàng này (có thể các món đã bị xóa khỏi menu).");
            }
        } catch (error) {
            console.error("Lỗi khi đặt lại đơn hàng:", error);
            alert("Đã xảy ra lỗi: " + (error.response?.data || error.message));
        } finally {
            setLoading(false);
        }
    };
    // ...

    if (loading) { return <p>Đang tải các đơn hàng của bạn...</p>; }
    if (orders.length === 0) { return <p>Bạn chưa có đơn hàng nào.</p>; }

    return (
        // --- 2. SỬ DỤNG className ---
        <div className={styles.container}>
            <h3>Đơn hàng của tôi</h3>
            <table className={styles.table}>
                <thead>
                <tr >
                    <th>Mã Đơn</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Thời gian đặt</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => {
                    const threeDaysAgo = Date.now() - 259200000;
                    const isRecent = new Date(order.orderTime).getTime() > threeDaysAgo;
                    const canReview = order.status === 'COMPLETED' && !order.isReviewed && isRecent;

                    return (
                        <tr key={order.id}>
                            <td>#{order.id}</td>
                            <td>{order.status}</td>
                            <td>{formatCurrency(order.grandTotal)}</td>
                            <td>{new Date(order.orderTime).toLocaleString()}</td>
                            <td className={styles.actionCell}>
                                <Link to={`/order-status/${order.id}`} className={styles.actionLink}>
                                    Xem
                                </Link>

                                {order.status !== 'CANCELLED' && (
                                    <button
                                        onClick={() => handleReOrder(order.id)}
                                        className={styles.actionButton}
                                    >
                                        Đặt lại
                                    </button>
                                )}

                                {canReview && (
                                    <Link
                                        to={`/review/${order.id}`}
                                        className={styles.reviewLink}
                                    >
                                        (Đánh giá)
                                    </Link>
                                )}
                                {order.isReviewed && (
                                    <span className={styles.reviewedText}>(Đã đánh giá)</span>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};