// src/components/KitchenDisplay.js
import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';

// ---- CẤU HÌNH ----
const WS_URL = 'ws://localhost:3000/ws';
const SUB_TOPIC = '/topic/kitchen'; // Kênh nhận đơn hàng MỚI
const SEND_DESTINATION = '/app/kitchen/update-status'; // Nơi gửi cập nhật trạng thái
// -----------------

/**
 * Một Card đại diện cho mỗi đơn hàng
 */
const OrderCard = ({ order, onUpdateStatus }) => {

    // Logic hiển thị nút bấm tùy theo trạng thái
    const renderActionButtons = () => {
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
                return <p className="status-done">Đã sẵn sàng</p>;
            default:
                return null;
        }
    };

    return (
        <div className="order-card">
            <h4>Đơn hàng #{order.id}</h4>
            <ul>
                {/* Giả định 'items' là một Set/Array và có 'menuItem' và 'quantity' */}
                {/* (Để đơn giản, chúng ta chỉ hiển thị tên.
                   Trong thực tế, bạn cần truy cập order.items) */}
                <li>(Chi tiết các món ăn ở đây)</li>
                <li>(Số lượng ở đây)</li>
            </ul>
            {renderActionButtons()}
        </div>
    );
};


/**
 * Component KDS Chính
 */
export const KitchenDisplay = () => {
    const [stompClient, setStompClient] = useState(null);
    const [orders, setOrders] = useState([]); // Danh sách tất cả đơn hàng

    // 1. Kết nối WebSocket khi component mount
    useEffect(() => {
        const client = new Client({
            brokerURL: WS_URL,
            reconnectDelay: 5000,
            onConnect: () => {
                console.log("KDS Đã kết nối WebSocket!");

                // Đăng ký (subscribe) vào topic của bếp
                client.subscribe(SUB_TOPIC, (message) => {
                    try {
                        const newOrder = JSON.parse(message.body);
                        console.log("Đơn hàng MỚI NHẬN:", newOrder);

                        // Thêm đơn hàng mới vào danh sách
                        setOrders(prevOrders => [...prevOrders, newOrder]);
                    } catch (e) {
                        console.error("Lỗi khi parse đơn hàng:", e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error("Lỗi STOMP (KDS):", frame);
            },
        });

        client.activate();
        setStompClient(client);

        // Cleanup: Ngắt kết nối khi component unmount
        return () => {
            if (client) {
                client.deactivate();
                console.log("KDS Đã ngắt kết nối.");
            }
        };
    }, []); // Chỉ chạy 1 lần

    // 3. Hàm xử lý Cập nhật Trạng thái (gửi tin nhắn đi)
    const handleUpdateStatus = (orderId, newStatus) => {
        if (stompClient && stompClient.connected) {
            const payload = {
                orderId: orderId,
                newStatus: newStatus
            };

            // Gửi tin nhắn đến backend (Prompt 7)
            stompClient.publish({
                destination: SEND_DESTINATION,
                body: JSON.stringify(payload)
            });

            // Cập nhật trạng thái local ngay lập tức (Optimistic Update)
            // để di chuyển card
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

        } else {
            console.error("STOMP client chưa kết nối.");
        }
    };

    // 2. Lọc đơn hàng cho 3 cột
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    return (
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
                    />
                ))}
            </div>

            {/* Thêm CSS đơn giản để hiển thị cột */}
            <style>{`
                .kds-container {
                    display: flex;
                    flex-direction: row;
                    gap: 15px;
                    padding: 10px;
                    background-color: #333;
                    min-height: 100vh;
                }
                .kds-column {
                    flex: 1;
                    background-color: #4a4a4a;
                    border-radius: 8px;
                    padding: 10px;
                }
                .col-header {
                    color: white;
                    text-align: center;
                    border-bottom: 2px solid;
                    padding-bottom: 10px;
                }
                .col-header.received { border-color: #3498db; }
                .col-header.preparing { border-color: #f1c40f; }
                .col-header.ready { border-color: #2ecc71; }

                .order-card {
                    background-color: #fdfdfd;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    padding: 15px;
                    margin-bottom: 10px;
                }
                .order-card h4 { margin-top: 0; }
                .btn {
                    width: 100%;
                    padding: 10px;
                    border: none;
                    border-radius: 4px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                }
                .btn.prepare { background-color: #f1c40f; }
                .btn.ready { background-color: #2ecc71; }
                .status-done { color: #2ecc71; font-weight: bold; }
            `}</style>
        </div>
    );
};