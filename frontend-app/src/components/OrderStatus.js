// src/components/OrderStatus.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';
import { formatCurrency } from '../utils/formatCurrency'; // Import hàm format

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${API_URL}/ws`;

export const OrderStatus = () => {
    const { orderId } = useParams();
    const { getItemName } = useMenu();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);

    useEffect(() => {
        const fetchCurrentOrder = async () => {
            setLoading(true);
            try {
                // (Logic fetch API giữ nguyên)
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

        const client = new Client();
        client.webSocketFactory = () => {
            return new SockJS(BACKEND_WS_URL);
        };

        client.onConnect = () => {
            console.log("Đã kết nối WebSocket (Trang thái Đơn hàng)!");
            fetchCurrentOrder();

            const topic = `/topic/order-status/${orderId}`;
            client.subscribe(topic, (message) => {
                const update = JSON.parse(message.body);
                console.log("Nhận được cập nhật:", update);

                setOrder(prevOrder => {
                    if (prevOrder) {
                        // Cập nhật chỉ trạng thái khi có tin nhắn WS
                        return { ...prevOrder, status: update.newStatus };
                    }
                    // (fetchCurrentOrder sẽ cập nhật phần còn lại)
                    fetchCurrentOrder();
                    return null;
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
    }, [orderId]);

    if (loading) {
        return <p>Đang tải chi tiết đơn hàng...</p>;
    }

    if (!order) {
        return <p>Không tìm thấy đơn hàng.</p>;
    }

    // --- SỬA GIAO DIỆN (JSX) ---
    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h3>Mã đơn: #{order.id}</h3>
            <h2 style={{ color: '#3498db' }}>Trạng thái: {order.status}</h2>

            {/* THÊM THÔNG TIN GIAO HÀNG (Goal 6) */}
            {order.deliveryAddress && (
                <div style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px', margin: '15px 0' }}>
                    <strong>Giao đến:</strong> {order.deliveryAddress}
                    {order.shipperNote && (
                        <div style={{ fontStyle: 'italic', color: '#555', marginTop: '5px' }}>
                            Ghi chú: {order.shipperNote}
                        </div>
                    )}
                </div>
            )}

            <hr style={{ margin: '20px 0' }} />

            <h4>Chi tiết đơn hàng:</h4>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {order.items && order.items.map((item, index) => (
                    <li key={index} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                            {item.quantity} x {getItemName(item.menuItemId)}
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

            {/* THÊM CHI TIẾT THANH TOÁN */}
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