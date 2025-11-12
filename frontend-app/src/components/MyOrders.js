// src/components/MyOrders.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; // <-- 1. THÊM useNavigate
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';     // <-- 2. THÊM IMPORT CART
import { useMenu } from '../context/MenuContext';     // <-- 3. THÊM IMPORT MENU

const API_URL = process.env.REACT_APP_API_URL;

export const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- 4. THÊM CÁC HOOKS ---
    const navigate = useNavigate();
    const { loadCartFromReorder } = useCart();
    const { menuItems } = useMenu(); // Lấy danh sách món ăn từ MenuContext
    // --- KẾT THÚC THÊM HOOKS ---

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

    // --- 5. THÊM HÀM HANDLER MỚI ---
    const handleReOrder = async (orderId) => {
        // 1. Xác nhận với người dùng
        const confirmed = window.confirm(
            "Đặt lại đơn hàng sẽ XÓA giỏ hàng hiện tại của bạn. Bạn có muốn tiếp tục?"
        );
        if (!confirmed) {
            return;
        }

        setLoading(true); // Hiển thị loading

        try {
            // 2. Gọi API để lấy chi tiết đơn hàng cũ
            const response = await axios.get(`${API_URL}/api/orders/${orderId}/reorder`);
            const reorderItems = response.data; // Đây là List<ReOrderItemDTO>

            if (reorderItems && reorderItems.length > 0) {
                // 3. Gọi hàm context để nạp giỏ hàng (truyền cả danh sách menu đầy đủ)
                loadCartFromReorder(reorderItems, menuItems);

                // 4. Chuyển hướng về trang chủ (nơi có giỏ hàng)
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
    // --- KẾT THÚC HÀM HANDLER ---


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
                    <th style={{ textAlign: 'left' }}>Hành động</th> {/* 6. ĐỔI TÊN CỘT */}
                </tr>
                </thead>
                <tbody>
                {orders.map(order => {
                    const threeDaysAgo = Date.now() - 259200000;
                    const isRecent = new Date(order.orderTime).getTime() > threeDaysAgo;
                    const canReview = order.status === 'COMPLETED' && !order.isReviewed && isRecent;

                    return (
                        <tr key={order.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td>#{order.id}</td>
                            <td>{order.status}</td>
                            <td>{formatCurrency(order.grandTotal)}</td>
                            <td>{new Date(order.orderTime).toLocaleString()}</td>

                            {/* 7. GOM CÁC HÀNH ĐỘNG VÀO MỘT CỘT */}
                            <td>
                                <Link to={`/order-status/${order.id}`} style={{ marginRight: '10px' }}>
                                    Xem
                                </Link>

                                {/* Nút Đặt lại */}
                                {order.status !== 'CANCELLED' && (
                                    <button
                                        onClick={() => handleReOrder(order.id)}
                                        style={{ padding: '3px 8px', cursor: 'pointer', marginRight: '10px' }}
                                    >
                                        Đặt lại
                                    </button>
                                )}

                                {/* Link Đánh giá */}
                                {canReview && (
                                    <Link
                                        to={`/review/${order.id}`}
                                        style={{color: 'orange', fontWeight: 'bold'}}
                                    >
                                        (Đánh giá)
                                    </Link>
                                )}
                                {order.isReviewed && (
                                    <span style={{color: 'gray'}}>(Đã đánh giá)</span>
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