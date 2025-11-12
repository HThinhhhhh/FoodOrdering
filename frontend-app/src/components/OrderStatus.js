import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${API_URL}/ws`;

// --- THÊM BẢN ĐỒ TRẠNG THÁI ---
// Cung cấp văn bản tiếng Việt cho khách hàng
const STATUS_MAP = {
    PENDING_CONFIRMATION: "Đang chờ xác nhận",
    RECEIVED: "Đã xác nhận (Đang chờ bếp)",
    PREPARING: "Bếp đang chuẩn bị",
    READY: "Đã chuẩn bị xong (Chờ giao)",
    DELIVERING: "Đang giao hàng",
    COMPLETED: "Đã hoàn thành",
    CANCELLED: "Đã hủy"
};
// --- KẾT THÚC THÊM ---

export const OrderStatus = () => {
    const { orderId } = useParams();
    const { getItemName } = useMenu();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);

    const fetchCurrentOrder = async () => {
        setLoading(true);
        try {
            // API này gọi OrderService (đã được sửa)
            const response = await axios.get(`${API_URL}/api/orders/my-orders`);
            const allOrders = response.data;
            const currentOrder = allOrders.find(o => o.id.toString() === orderId);

            if (currentOrder) {
                setOrder(currentOrder);
            }
        } catch (e) {
            console.error("Lỗi khi tải trạng thái đơn hàng:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        client.onConnect = () => {
            console.log("Đã kết nối WebSocket (Trang thái Đơn hàng)!");
            // Tải đơn hàng ban đầu
            fetchCurrentOrder();

            const topic = `/topic/order-status/${orderId}`;
            client.subscribe(topic, (message) => {
                const update = JSON.parse(message.body);
                console.log("Nhận được cập nhật:", update);

                // Cập nhật state với thông tin mới
                setOrder(prevOrder => {
                    if (!prevOrder) {
                        // Nếu state rỗng, tải lại (ít khi xảy ra)
                        fetchCurrentOrder();
                        return null;
                    }

                    // Cập nhật state hiện tại
                    return {
                        ...prevOrder,
                        status: update.newStatus || prevOrder.status, // Giữ status cũ nếu update không có
                        cancellationReason: update.reason || prevOrder.cancellationReason,
                        deliveryNote: update.deliveryNote || prevOrder.deliveryNote // <-- CẬP NHẬT MỚI
                    };
                });
            });
        };

        client.onStompError = (frame) => console.error("Lỗi STOMP:", frame);
        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("Đã ngắt kết nối WebSocket.");
            }
        };
    }, [orderId]); // Chỉ phụ thuộc vào orderId

    if (loading) {
        return <p>Đang tải chi tiết đơn hàng...</p>;
    }
    if (!order) {
        return <p>Không tìm thấy đơn hàng.</p>;
    }

    // Lấy tên trạng thái tiếng Việt
    const statusText = STATUS_MAP[order.status] || order.status;

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h3>Mã đơn: #{order.id}</h3>

            {/* 1. Hiển thị trạng thái Hủy */}
            {order.status === 'CANCELLED' ? (
                <div style={{ background: '#ffebee', border: '1px solid #e74c3c', padding: '15px', borderRadius: '5px' }}>
                    <h2 style={{ color: '#e74c3c', margin: 0 }}>Trạng thái: {statusText}</h2>
                    {order.cancellationReason && (
                        <p style={{ margin: '10px 0 0 0', fontStyle: 'italic' }}>
                            Lý do: {order.cancellationReason}
                        </p>
                    )}
                </div>
            ) : (
                // 2. Hiển thị các trạng thái khác
                <h2 style={{ color: '#3498db' }}>Trạng thái: {statusText}</h2>
            )}

            {/* 3. THÊM HIỂN THỊ GHI CHÚ GIAO HÀNG (Khách thấy) */}
            {order.deliveryNote && (
                <div style={{ background: '#e0f2f1', border: '1px solid #00796b', padding: '15px', borderRadius: '5px', margin: '15px 0' }}>
                    <strong>Thông tin giao hàng:</strong>
                    {/* whiteSpace: 'pre-wrap' để giữ các ký tự xuống dòng (nếu Admin nhập) */}
                    <p style={{ margin: '5px 0 0 0', whiteSpace: 'pre-wrap', fontSize: '1.1em' }}>
                        {order.deliveryNote}
                    </p>
                </div>
            )}
            {/* --- KẾT THÚC THÊM --- */}

            {/* (Thông tin giao hàng của Khách) */}
            {order.deliveryAddress && (
                <div style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px', margin: '15px 0' }}>
                    <strong>Giao đến:</strong> {order.deliveryAddress}
                    {order.shipperNote && (
                        <div style={{ fontStyle: 'italic', color: '#555', marginTop: '5px' }}>
                            Ghi chú của bạn: {order.shipperNote}
                        </div>
                    )}
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <h4>Chi tiết đơn hàng:</h4>
            {/* (Chi tiết món ăn) */}
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {order.items && order.items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                            {item.quantity} x {item.name || getItemName(item.menuItemId)}
                        </div>
                        {item.note && (
                            <div style={{ fontSize: '0.9em', color: 'gray', fontStyle: 'italic', paddingLeft: '10px' }}>
                                ↳ Ghi chú: {item.note}
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            <hr style={{ margin: '20px 0' }} />

            {/* (Chi tiết thanh toán) */}
            <div style={{ textAlign: 'right', lineHeight: '1.6em' }}>
                <div>Tạm tính: {formatCurrency(order.subtotal)}</div>
                <div>VAT (15%): {formatCurrency(order.vatAmount)}</div>
                <div>Phí vận chuyển: {formatCurrency(order.shippingFee)}</div>
                <h3 style={{ marginTop: '10px' }}>
                    Tổng tiền: {formatCurrency(order.grandTotal)}
                </h3>
                <div>(Thanh toán bằng: {order.paymentMethod})</div>
            </div>
        </div>
    );
};