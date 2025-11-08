// src/components/OrderStatus.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios'; // <-- Đảm bảo bạn đã import axios

// --- SỬA LẠI CÁCH KẾT NỐI ---
const API_URL = process.env.REACT_APP_API_URL; // http://localhost:8080
const BACKEND_WS_URL = `${API_URL}/ws`;
// ----------------------------

export const OrderStatus = () => {
    const { orderId } = useParams();
    const [orderStatus, setOrderStatus] = useState("Đang tải trạng thái...");
    const [stompClient, setStompClient] = useState(null);

    useEffect(() => {
        const fetchCurrentStatus = async () => {
            try {
                // --- SỬA LẠI LỆNH GỌI API (THÊM URL ĐẦY ĐỦ) ---
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                const allOrders = response.data;
                const currentOrder = allOrders.find(o => o.id.toString() === orderId);
                if (currentOrder) {
                    setOrderStatus(currentOrder.status);
                } else {
                    setOrderStatus("Không tìm thấy đơn hàng");
                }
            } catch (e) {
                console.error("Lỗi khi tải trạng thái đơn hàng:", e);
                setOrderStatus("Lỗi tải trạng thái");
            }
        };

        const client = new Client();
        client.webSocketFactory = () => {
            return new SockJS(BACKEND_WS_URL);
        };

        client.onConnect = () => {
            console.log("Đã kết nối WebSocket (Trang thái Đơn hàng)!");
            fetchCurrentStatus();

            const topic = `/topic/order-status/${orderId}`;
            client.subscribe(topic, (message) => {
                const update = JSON.parse(message.body);
                console.log("Nhận được cập nhật:", update);
                setOrderStatus(update.newStatus);
            });
        };

        client.onStompError = (frame) => console.error("Lỗi STOMP:", frame);
        client.activate();
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
                console.log("Đã ngắt kết nối WebSocket.");
            }
        };
    }, [orderId]);

    return (
        <div>
            <h3>Trạng thái Đơn hàng #{orderId}</h3>
            <h2>{orderStatus}</h2>
        </div>
    );
};