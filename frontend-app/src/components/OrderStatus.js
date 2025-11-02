// src/components/OrderStatus.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';

// Trỏ WebSocket đến chính máy chủ React (3000), 
// nó sẽ tự động chuyển tiếp
const WS_URL = 'ws://localhost:3000/ws';

export const OrderStatus = () => {
    const { orderId } = useParams(); // Lấy ID từ URL (vd: /order-status/123)
    const [orderStatus, setOrderStatus] = useState("Đang chờ xác nhận...");
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        // 1. Khởi tạo Stomp Client
        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("Đã kết nối WebSocket!");

                // 2. Đăng ký (subscribe) vào topic động
                const topic = `/topic/order-status/${orderId}`;
                console.log("Đang lắng nghe trên:", topic);

                client.subscribe(topic, (message) => {
                    const update = JSON.parse(message.body);
                    console.log("Nhận được cập nhật:", update);
                    // Cập nhật trạng thái (ví dụ: "PREPARING", "READY")
                    setOrderStatus(update.newStatus);
                });
            },
            onStompError: (frame) => {
                console.error("Lỗi STOMP:", frame);
            },
        });

        // 3. Kích hoạt kết nối
        client.activate();
        setStompClient(client);

        // 4. Cleanup: Ngắt kết nối khi component bị unmount
        return () => {
            if (client) {
                client.deactivate();
                console.log("Đã ngắt kết nối WebSocket.");
            }
        };
    }, [orderId]); // Chỉ chạy lại khi orderId thay đổi

    return (
        <div>
            <h3>Trạng thái Đơn hàng #{orderId}</h3>
            <h2>{orderStatus}</h2>
        </div>
    );
};