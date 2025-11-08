// src/components/OrderStatus.js
import React, { useState, useEffect, useRef } from 'react'; // 1. IMPORT useRef
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

// (Cấu hình URL giữ nguyên)
const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${API_URL}/ws`;

export const OrderStatus = () => {
    const { orderId } = useParams();
    const { getItemName } = useMenu();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    // const [stompClient, setStompClient] = useState(null); // 2. XÓA DÒNG NÀY
    const stompClientRef = useRef(null); // 3. THAY BẰNG useRef

    useEffect(() => {
        const fetchCurrentOrder = async () => {
            setLoading(true);
            try {
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

                // Cập nhật trạng thái trong đối tượng Order
                setOrder(prevOrder => {
                    if (prevOrder) {
                        return { ...prevOrder, status: update.newStatus };
                    }
                    // (Nếu prevOrder là null, chỉ cần set status)
                    return { status: update.newStatus };
                });
            });
        };

        client.onStompError = (frame) => console.error("Lỗi STOMP:", frame);
        client.activate();

        // 4. LƯU VÀO REF (Không gây re-render)
        stompClientRef.current = client;
        // setStompClient(client); // <-- XÓA DÒNG NÀY

        // 5. HÀM CLEANUP SỬ DỤNG REF
        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("Đã ngắt kết nối WebSocket.");
            }
        };
    }, [orderId]); // Phụ thuộc vào orderId

    // (Phần JSX return giữ nguyên)
    if (loading) {
        return <p>Đang tải chi tiết đơn hàng...</p>;
    }

    if (!order) {
        return <p>Không tìm thấy đơn hàng.</p>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <h3>Mã đơn: #{order.id}</h3>
            <h2 style={{ color: '#3498db' }}>Trạng thái: {order.status}</h2>

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

            <h3 style={{ textAlign: 'right' }}>
                Tổng tiền: ${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}
            </h3>
        </div>
    );
};