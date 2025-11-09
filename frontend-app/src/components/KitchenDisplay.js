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

// (OrderCard giữ nguyên)
const OrderCard = ({ order, onUpdateStatus, onCancelOrder, getItemName }) => {
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

    const renderActionButtons = () => {
        switch (order.status) {
            case 'RECEIVED':
                return ( <button className="btn prepare" onClick={() => onUpdateStatus(order.id, 'PREPARING')}>Bắt đầu chuẩn bị</button> );
            case 'PREPARING':
                return ( <button className="btn ready" onClick={() => onUpdateStatus(order.id, 'READY')}>Hoàn thành (Sẵn sàng)</button> );
            case 'READY':
                return ( <button className="btn completed" onClick={() => onUpdateStatus(order.id, 'COMPLETED')}>Đã giao</button> );
            case 'CANCELLED':
                return <p className="status-cancelled">ĐÃ HỦY</p>;
            default:
                return null;
        }
    };

    const handleCancelClick = () => {
        const reason = prompt("Bạn có chắc chắn muốn HỦY đơn hàng này không?\nNhập lý do hủy (sẽ hiển thị cho khách hàng):");
        if (reason === null) { return; }
        if (reason.trim() === "") { alert("Bạn phải nhập lý do hủy đơn hàng."); return; }
        onCancelOrder(order.id, reason);
    };

    return (
        <div className="order-card">
            <h4>Đơn hàng #{order.id}</h4>

            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                <li style={{ background: '#fff8e1', padding: '5px', borderRadius: '4px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Giao đến: {order.deliveryAddress}</div>
                    {order.shipperNote && (
                        <div style={{ fontStyle: 'italic', color: '#555', marginTop: '5px' }}>
                            Ghi chú tài xế: {order.shipperNote}
                        </div>
                    )}
                </li>

                {order.items && order.items.map((item, index) => {
                    const isTicked = tickedItems.has(index);
                    const itemStyle = {
                        textDecoration: isTicked ? 'line-through' : 'none',
                        opacity: isTicked ? 0.5 : 1,
                        cursor: order.status === 'PREPARING' ? 'pointer' : 'default',
                        userSelect: 'none',
                        paddingBottom: '5px',
                        marginBottom: '5px',
                        borderBottom: '1px solid #f0f0f0'
                    };
                    return (
                        <li
                            key={index}
                            style={itemStyle}
                            onClick={() => (order.status === 'PREPARING' ? handleToggleTick(index) : null)}
                        >
                            {item.quantity} x {getItemName(item.menuItemId)}
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

            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                <button
                    className="btn cancel"
                    onClick={handleCancelClick}
                    style={{marginTop: '5px'}}
                >
                    Hủy Đơn Hàng
                </button>
            )}
        </div>
    );
};


/**
 * Component KDS Chính
 */
export const KitchenDisplay = () => {
    // (Phần state và useEffect kết nối/lắng nghe giữ nguyên)
    const stompClientRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const { getItemName } = useMenu();

    useEffect(() => {
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        const fetchActiveOrders = async () => {
            try {
                // Sửa logic tải: Giờ đây chúng ta tải TẤT CẢ trừ COMPLETED
                // (Backend đã sửa KitchenService.getActiveOrders)
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
        const client = stompClientRef.current;
        if (client && client.connected) {
            const payload = { orderId: orderId, newStatus: newStatus };
            client.publish({
                destination: SEND_DESTINATION,
                body: JSON.stringify(payload)
            });

            // Sửa logic: KHÔNG xóa đơn COMPLETED
            // (Chúng ta sẽ lọc nó ra ở hàm fetchActiveOrders lần sau)
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } else {
            console.error("STOMP client chưa kết nối.");
        }
    };

    // (handleCancelOrder giữ nguyên)
    const handleCancelOrder = async (orderId, reason) => {
        const client = stompClientRef.current;
        if (!client || !client.connected) { /* ... */ return; }

        try {
            await axios.post(`${KITCHEN_API_URL}/api/kitchen/cancel-order`, {
                orderId: orderId,
                reason: reason
            });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: 'CANCELLED', cancellationReason: reason } : order
                )
            );
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            alert("Đã xảy ra lỗi khi hủy đơn hàng: " + (error.response?.data || error.message));
        }
    };

    // --- SỬA LOGIC LỌC (Bug 2 & Yêu cầu mới) ---
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY'); // Chỉ Sẵn sàng
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED'); // Chỉ Đã hủy
    // (Đơn COMPLETED sẽ tự động bị ẩn đi khi tải lại trang
    //  vì API getActiveOrders không lấy chúng)
    // --- KẾT THÚC SỬA ---

    return (
        <div className="kds-container">
            {/* Cột 1: Đã nhận (1:2:1) */}
            <div className="kds-column" style={{ flex: 1 }}>
                <h2 className="col-header received">
                    Đã nhận ({receivedOrders.length})
                </h2>
                {receivedOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* Cột 2: Đang chuẩn bị (1:2:1) */}
            <div className="kds-column" style={{ flex: 2 }}>
                <h2 className="col-header preparing">
                    Đang chuẩn bị ({preparingOrders.length})
                </h2>
                {preparingOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* --- BẮT ĐẦU SỬA CỘT 3 (Goal 3) --- */}
            <div className="kds-column" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, background: 'none' }}>

                {/* Nửa trên: Sẵn sàng */}
                <div className="kds-sub-column" style={{ flex: 1 }}>
                    <h2 className="col-header ready">
                        Sẵn sàng ({readyOrders.length})
                    </h2>
                    <div style={{padding: '10px'}}>
                        {readyOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                                onCancelOrder={handleCancelOrder}
                                getItemName={getItemName}
                            />
                        ))}
                    </div>
                </div>

                {/* Nửa dưới: Đã hủy */}
                <div className="kds-sub-column" style={{ flex: 1, marginTop: '15px' }}>
                    <h2 className="col-header cancelled">
                        Đã hủy ({cancelledOrders.length})
                    </h2>
                    <div style={{padding: '10px'}}>
                        {cancelledOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onUpdateStatus={handleUpdateStatus}
                                onCancelOrder={handleCancelOrder}
                                getItemName={getItemName}
                            />
                        ))}
                    </div>
                </div>
            </div>
            {/* --- KẾT THÚC SỬA CỘT 3 --- */}

            {/* (CSS) */}
            <style>{`
                .kds-container { display: flex; flex-direction: row; gap: 15px; padding: 10px; background-color: #333; min-height: 100vh; }
                .kds-column { /* flex: 1; */ background-color: #4a4a4a; border-radius: 8px; padding: 10px; }
                
                /* CSS CHO CỘT CON (MỚI) */
                .kds-sub-column { background-color: #4a4a4a; border-radius: 8px; overflow-y: auto; }
                .col-header { color: white; text-align: center; border-bottom: 2px solid; padding-bottom: 10px; margin: 0; padding: 10px; }
                
                .col-header.received { border-color: #3498db; }
                .col-header.preparing { border-color: #f1c40f; }
                .col-header.ready { border-color: #2ecc71; }
                .col-header.cancelled { border-color: #e74c3c; } /* Thêm màu cho header Hủy */

                .order-card { background-color: #fdfdfd; border: 1px solid #ccc; border-radius: 5px; padding: 15px; margin-bottom: 10px; }
                .order-card h4 { margin-top: 0; }
                .btn { width: 100%; padding: 10px; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; }
                .btn.prepare { background-color: #f1c40f; }
                .btn.ready { background-color: #2ecc71; }
                .btn.completed { background-color: #95a5a6; }
                .btn.cancel { background-color: #e74c3c; }
                .status-cancelled { color: #e74c3c; font-weight: bold; text-align: center; }
            `}</style>
        </div>
    );
};