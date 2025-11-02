// src/components/KitchenDisplay.js
import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client'; // <-- THÊM IMPORT NÀY

// ---- CẤU HÌNH ĐÃ SỬA ----
// Chúng ta sẽ dùng HTTP URL cho SockJS, nó sẽ tự nâng cấp lên WS
const BACKEND_WS_URL = 'http://localhost:8080/ws'; // <-- SỬA PORT THÀNH 8080
const SUB_TOPIC = '/topic/kitchen';
const SEND_DESTINATION = '/app/kitchen/update-status';
// -----------------------

/**
 * Một Card đại diện cho mỗi đơn hàng (GIỮ NGUYÊN)
 */
const OrderCard = ({ order, onUpdateStatus }) => {
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
                {/* Giờ chúng ta có thể hiển thị chi tiết
                   Giả sử 'items' là một mảng
                 */}
                {order.items && order.items.map((item, index) => (
                    <li key={index}>
                        {item.quantity} x (Tên món ăn ID: {item.menuItemId})
                    </li>
                ))}
                {/* Bạn sẽ cần fetch tên món ăn từ ID trong thực tế */}
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
    const [orders, setOrders] = useState([]);

    // --- SỬA LOGIC KẾT NỐI TRONG USEEFFECT ---
    useEffect(() => {

        // 1. Khởi tạo Client
        const client = new Client();

        // 2. (QUAN TRỌNG) Sử dụng SockJS làm "nhà máy" kết nối
        client.webSocketFactory = () => {
            return new SockJS(BACKEND_WS_URL);
        };

        // 3. (Giữ nguyên) Xử lý khi kết nối thành công
        client.onConnect = () => {
            console.log("KDS Đã kết nối WebSocket!");

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
        };

        // 4. (Giữ nguyên) Xử lý lỗi
        client.onStompError = (frame) => {
            console.error("Lỗi STOMP (KDS):", frame);
        };

        // 5. Kích hoạt kết nối
        client.activate();
        setStompClient(client);

        // Cleanup
        return () => {
            if (client) {
                client.deactivate();
                console.log("KDS Đã ngắt kết nối.");
            }
        };
    }, []); // Chỉ chạy 1 lần
    // --- KẾT THÚC SỬA ĐỔI USEEFFECT ---


    // (Phần còn lại của tệp giữ nguyên)

    // 3. Hàm xử lý Cập nhật Trạng thái (gửi tin nhắn đi)
    const handleUpdateStatus = (orderId, newStatus) => {
        if (stompClient && stompClient.connected) {
            const payload = {
                orderId: orderId,
                newStatus: newStatus
            };

            stompClient.publish({
                destination: SEND_DESTINATION,
                body: JSON.stringify(payload)
            });

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

            {/* (CSS giữ nguyên) */}
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