// src/components/KitchenDisplay.js
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

// (Cấu hình URL giữ nguyên)
const KITCHEN_API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${KITCHEN_API_URL}/ws`;
const SUB_TOPIC = '/topic/kitchen';
const SEND_DESTINATION = '/app/kitchen/update-status';

// --- BẮT ĐẦU: SỬA OrderCard (Req 2 & 4) ---
/**
 * Một Card đại diện cho mỗi đơn hàng
 * Giờ đây nó sẽ quản lý state 'ticked' (đã đánh dấu) của riêng mình
 */
const OrderCard = ({ order, onUpdateStatus, getItemName }) => {
    // Req 4: Quản lý state đánh dấu cho từng món
    const [tickedItems, setTickedItems] = useState(new Set());

    const handleToggleTick = (itemIndex) => {
        setTickedItems(prevTicked => {
            const newTicked = new Set(prevTicked);
            if (newTicked.has(itemIndex)) {
                newTicked.delete(itemIndex);
            } else {
                newTicked.add(itemIndex);
            }
            return newTicked;
        });
    };

    // (renderActionButtons giữ nguyên)
    const renderActionButtons = () => {
        // ... (Giữ nguyên logic switch/case: RECEIVED, PREPARING, READY, COMPLETED)
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
                {order.items && order.items.map((item, index) => {
                    const isTicked = tickedItems.has(index);
                    const itemStyle = {
                        textDecoration: isTicked ? 'line-through' : 'none',
                        opacity: isTicked ? 0.5 : 1,
                        cursor: 'pointer',
                        userSelect: 'none'
                    };

                    return (
                        <li
                            key={index}
                            style={itemStyle}
                            onClick={() => handleToggleTick(index)} // Req 4: Click để đánh dấu
                        >
                            {item.quantity} x {getItemName(item.menuItemId)}

                            {/* Req 2: Hiển thị ghi chú nếu có */}
                            {item.note && (
                                <div style={{ fontSize: '0.9em', color: 'gray', fontStyle: 'italic' }}>
                                    ↳ Ghi chú: {item.note}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
            {renderActionButtons()}
        </div>
    );
};
// --- KẾT THÚC: SỬA OrderCard ---


/**
 * Component KDS Chính
 */
export const KitchenDisplay = () => {
    // (Phần state và useEffect giữ nguyên)
    const stompClientRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const { getItemName } = useMenu();

    useEffect(() => {
        // ... (Toàn bộ logic kết nối, fetch, subscribe giữ nguyên)
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        const fetchActiveOrders = async () => {
            try {
                const response = await axios.get(`${KITCHEN_API_URL}/api/kitchen/active-orders`);
                setOrders(response.data);
                console.log("KDS Đã tải " + response.data.length + " đơn hàng đang hoạt động.");
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng đang hoạt động:", error);
            }
        };

        client.onConnect = () => {
            console.log("KDS Đã kết nối WebSocket!");
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

    // (handleUpdateStatus giữ nguyên)
    const handleUpdateStatus = (orderId, newStatus) => {
        // ... (Toàn bộ logic publish và cập nhật state giữ nguyên)
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

    // (Phần lọc giữ nguyên)
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    return (
        <div className="kds-container">
            {/* Cột 1: Đã nhận */}
            <div className="kds-column" style={{ flex: 1 }}> {/* Req 3: flex: 1 */}
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
            <div className="kds-column" style={{ flex: 2 }}> {/* Req 3: flex: 2 */}
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
            <div className="kds-column" style={{ flex: 1 }}> {/* Req 3: flex: 1 */}
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
                .kds-column { /* flex: 1; */ /* Xóa flex: 1 cũ ở đây */ background-color: #4a4a4a; border-radius: 8px; padding: 10px; }
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