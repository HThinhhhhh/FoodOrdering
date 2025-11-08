// src/components/KitchenDisplay.js
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

// ---- CẤU HÌNH ĐỘNG (SỬA LỖI) ----
// Lấy API URL từ biến môi trường (sẽ là http://localhost:8080)
const KITCHEN_API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${KITCHEN_API_URL}/ws`; // Trỏ đến 8080/ws
// ---------------------------------

const SUB_TOPIC = '/topic/kitchen';
const SEND_DESTINATION = '/app/kitchen/update-status';

// (OrderCard giữ nguyên)
const OrderCard = ({ order, onUpdateStatus, getItemName }) => {
    // ... (Giữ nguyên toàn bộ code của OrderCard)
    const renderActionButtons = () => {
        // (Giữ nguyên logic switch/case)
        switch (order.status) {
            case 'RECEIVED':
                return (
                    <button
                        className="btn prepare"
                        onClick={() => onUpdateStatus(order.id, 'PREPARING')}
                    >
                        Bắt đầu chuẩn bị
                    </button>
                );
            case 'PREPARING':
                return (
                    <button
                        className="btn ready"
                        onClick={() => onUpdateStatus(order.id, 'READY')}
                    >
                        Hoàn thành (Sẵn sàng)
                    </button>
                );
            case 'READY':
                return (
                    <button
                        className="btn completed"
                        onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
                    >
                        Đã giao
                    </button>
                );
            default:
                return null;
        }
    };
    return (
        <div className="order-card">
            <h4>Đơn hàng #{order.id}</h4>
            <ul>
                {order.items && order.items.map((item, index) => (
                    <li key={index}>
                        {item.quantity} x {getItemName(item.menuItemId)}
                    </li>
                ))}
            </ul>
            {renderActionButtons()}
        </div>
    );
};

// (Component KDS Chính giữ nguyên logic, chỉ thay đổi URL)
export const KitchenDisplay = () => {
    const stompClientRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const { getItemName } = useMenu();

    useEffect(() => {
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL); // Đã trỏ đúng 8080

        const fetchActiveOrders = async () => {
            try {
                // SỬA LỖI: Dùng KITCHEN_API_URL (trỏ đến 8080)
                const response = await axios.get(`${KITCHEN_API_URL}/api/kitchen/active-orders`);
                setOrders(response.data);
                console.log("KDS Đã tải " + response.data.length + " đơn hàng đang hoạt động từ 8080.");
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng đang hoạt động:", error);
            }
        };

        client.onConnect = () => {
            console.log("KDS Đã kết nối WebSocket (8080)!");
            fetchActiveOrders();

            client.subscribe(SUB_TOPIC, (message) => {
                try {
                    const newOrder = JSON.parse(message.body);
                    console.log("Đơn hàng MỚI NHẬN (WS):", newOrder);

                    setOrders(prevOrders => {
                        const orderExists = prevOrders.some(o => o.id === newOrder.id);
                        if (orderExists) {
                            return prevOrders.map(o => o.id === newOrder.id ? newOrder : o);
                        } else {
                            return [...prevOrders, newOrder];
                        }
                    });
                } catch (e) {
                    console.error("Lỗi khi parse đơn hàng:", e);
                }
            });
        };

        client.onStompError = (frame) => console.error("Lỗi STOMP (KDS):", frame);
        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("KDS Đã ngắt kết nối.");
            }
        };
    }, []);

    const handleUpdateStatus = (orderId, newStatus) => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            const payload = { orderId: orderId, newStatus: newStatus };

            client.publish({
                destination: SEND_DESTINATION,
                body: JSON.stringify(payload)
            });

            if (newStatus === 'COMPLETED') {
                setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            } else {
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.id === orderId ? { ...order, status: newStatus } : order
                    )
                );
            }
        } else {
            console.error("STOMP client chưa kết nối.");
        }
    };

    // (Phần lọc và render JSX giữ nguyên)
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    return (
        // (Toàn bộ JSX giữ nguyên)
        <div className="kds-container">
            {/* Cột 1: Đã nhận */}
            <div className="kds-column">
                <h2 className="col-header received">
                    Đã nhận ({receivedOrders.length})
                </h2>
                {receivedOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* Cột 2: Đang chuẩn bị */}
            <div className="kds-column">
                <h2 className="col-header preparing">
                    Đang chuẩn bị ({preparingOrders.length})
                </h2>
                {preparingOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* Cột 3: Sẵn sàng */}
            <div className="kds-column">
                <h2 className="col-header ready">
                    Sẵn sàng ({readyOrders.length})
                </h2>
                {readyOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* (CSS giữ nguyên) */}
            <style>{`
                .kds-container { display: flex; flex-direction: row; gap: 15px; padding: 10px; background-color: #333; min-height: 100vh; }
                .kds-column { flex: 1; background-color: #4a4a4a; border-radius: 8px; padding: 10px; }
                .col-header { color: white; text-align: center; border-bottom: 2px solid; padding-bottom: 10px; }
                .col-header.received { border-color: #3498db; }
                .col-header.preparing { border-color: #f1c40f; }
                .col-header.ready { border-color: #2ecc71; }
                .order-card { background-color: #fdfdfd; border: 1px solid #ccc; border-radius: 5px; padding: 15px; margin-bottom: 10px; }
                .order-card h4 { margin-top: 0; }
                .btn { width: 100%; padding: 10px; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; }
                .btn.prepare { background-color: #f1c40f; }
                .btn.ready { background-color: #2ecc71; }
                .btn.completed { background-color: #95a5a6; }
            `}</style>
        </div>
    );
};