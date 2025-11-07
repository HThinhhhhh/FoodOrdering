// src/components/KitchenDisplay.js
import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios'; // <-- 1. IMPORT AXIOS
import { useMenu } from '../context/MenuContext'; // <-- 2. IMPORT MENU CONTEXT

// (Cấu hình giữ nguyên)
const BACKEND_WS_URL = 'http://localhost:8080/ws';
const SUB_TOPIC = '/topic/kitchen';
const SEND_DESTINATION = '/app/kitchen/update-status';

/**
 * Sửa OrderCard để chấp nhận { getItemName }
 */
const OrderCard = ({ order, onUpdateStatus, getItemName }) => { // <-- 3. NHẬN getItemName

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
                // --- 4. THÊM NÚT HOÀN THÀNH ---
                return (
                    <button
                        className="btn completed" // Thêm class mới
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
                {/* --- 5. HIỂN THỊ TÊN MÓN ĂN THẬT --- */}
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


/**
 * Component KDS Chính (Đã nâng cấp)
 */
export const KitchenDisplay = () => {
    const [stompClient, setStompClient] = useState(null);
    const [orders, setOrders] = useState([]);
    const { getItemName } = useMenu(); // <-- 6. LẤY HÀM TRA CỨU TỪ CONTEXT

    // --- 7. SỬA ĐỔI USEEFFECT ---
    useEffect(() => {
        // --- 7a. HÀM TẢI CÁC ĐƠN HÀNG ĐANG HOẠT ĐỘNG ---
        const fetchActiveOrders = async () => {
            try {
                const response = await axios.get("/api/kitchen/active-orders");
                setOrders(response.data); // Set các đơn hàng ban đầu
                console.log("KDS Đã tải " + response.data.length + " đơn hàng đang hoạt động.");
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng đang hoạt động:", error);
            }
        };

        // 1. Khởi tạo Client
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        // 3. Xử lý khi kết nối thành công
        client.onConnect = () => {
            console.log("KDS Đã kết nối WebSocket!");

            // --- 7b. TẢI ĐƠN HÀNG NGAY KHI KẾT NỐI ---
            // (Để tránh race condition: kết nối xong -> tải đơn -> lắng nghe)
            fetchActiveOrders();

            client.subscribe(SUB_TOPIC, (message) => {
                try {
                    const newOrder = JSON.parse(message.body);
                    console.log("Đơn hàng MỚI NHẬN (WS):", newOrder);

                    // --- 7c. LOGIC CHỐNG TRÙNG LẶP ---
                    // Thêm đơn hàng mới, nhưng chỉ khi nó chưa có trong danh sách
                    setOrders(prevOrders => {
                        const orderExists = prevOrders.some(o => o.id === newOrder.id);
                        if (orderExists) {
                            // Nếu đã tồn tại (có thể từ fetchActiveOrders), hãy cập nhật nó
                            return prevOrders.map(o => o.id === newOrder.id ? newOrder : o);
                        } else {
                            // Nếu là đơn hàng mới tinh, thêm vào
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
        setStompClient(client);

        return () => {
            if (client) {
                client.deactivate();
                console.log("KDS Đã ngắt kết nối.");
            }
        };
    }, []); // Chỉ chạy 1 lần

    // --- 8. SỬA ĐỔI HÀM CẬP NHẬT TRẠNG THÁI ---
    const handleUpdateStatus = (orderId, newStatus) => {
        if (stompClient && stompClient.connected) {
            const payload = { orderId: orderId, newStatus: newStatus };

            stompClient.publish({
                destination: SEND_DESTINATION,
                body: JSON.stringify(payload)
            });

            // Cập nhật trạng thái local
            if (newStatus === 'COMPLETED') {
                // Nếu hoàn thành, XÓA nó khỏi màn hình KDS
                setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
            } else {
                // Nếu chỉ thay đổi trạng thái (RECEIVED -> PREPARING)
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

    // Lọc đơn hàng (Giữ nguyên)
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');

    // (Phần JSX render)
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
                        getItemName={getItemName} // <-- 9. TRUYỀN HÀM XUỐNG
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
                        getItemName={getItemName} // <-- 9. TRUYỀN HÀM XUỐNG
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
                        getItemName={getItemName} // <-- 9. TRUYỀN HÀM XUỐNG
                    />
                ))}
            </div>

            {/* (CSS) */}
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
                .btn.completed { background-color: #95a5a6; } /* <-- 10. THÊM CSS CHO NÚT MỚI */
            `}</style>
        </div>
    );
};