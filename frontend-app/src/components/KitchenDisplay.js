// src/components/KitchenDisplay.js
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

const KITCHEN_API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${KITCHEN_API_URL}/ws`;
const SUB_TOPIC = '/topic/kitchen';
const SEND_DESTINATION = '/app/kitchen/update-status';

// Component OrderCard
const OrderCard = ({ order, onUpdateStatus, onCancelOrder, onAddNote, getItemName }) => {
    const [tickedItems, setTickedItems] = useState(new Set());

    const handleToggleTick = (itemIndex) => {
        setTickedItems(prevTicked => {
            const newTicked = new Set(prevTicked);
            if (newTicked.has(itemIndex)) newTicked.delete(itemIndex);
            else newTicked.add(itemIndex);
            return newTicked;
        });
    };

    // --- SỬA ĐỔI: LOGIC NÚT BẤM CỦA BẾP ---
    const renderActionButtons = () => {
        switch (order.status) {
            case 'RECEIVED': // Admin vừa đẩy xuống
                return ( <button className="btn prepare" onClick={() => onUpdateStatus(order.id, 'PREPARING', 'Bắt đầu chuẩn bị đơn này?')}>Bắt đầu chuẩn bị</button> );
            case 'PREPARING': // Bếp đang làm
                return ( <button className="btn ready" onClick={() => onUpdateStatus(order.id, 'READY', 'Hoàn thành đơn này (sẵn sàng giao)?')}>Hoàn thành (Sẵn sàng)</button> );
            case 'READY': // Bếp đã làm xong, chờ Admin/Shipper
                return <p className="status-ready">ĐÃ SẴN SÀNG (Chờ giao)</p>;
            case 'CANCELLED':
                return <p className="status-cancelled">ĐÃ HỦY</p>;
            default: // (PENDING, DELIVERING, COMPLETED Bếp không thấy)
                return null;
        }
    };
    // --- KẾT THÚC SỬA ĐỔI ---

    const handleCancelClick = () => {
        const reason = prompt("Bạn có chắc chắn muốn HỦY đơn hàng này không?\nNhập lý do hủy (sẽ hiển thị cho khách hàng):");
        if (reason === null) { return; }
        if (reason.trim() === "") { alert("Bạn phải nhập lý do hủy đơn hàng."); return; }

        // --- THÊM XÁC NHẬN ---
        if (window.confirm(`Bạn có chắc muốn HỦY đơn hàng #${order.id} với lý do: "${reason}"?`)) {
            onCancelOrder(order.id, reason);
        }
    };

    const handleAddNoteClick = () => {
        const currentNote = order.kitchenNote || ""; // Sửa: internalNote -> kitchenNote
        const note = prompt("Thêm hoặc sửa ghi chú bếp (Admin sẽ thấy):", currentNote);
        if (note !== null) {
            onAddNote(order.id, note);
        }
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

                {/* Sửa: internalNote -> kitchenNote */}
                {order.kitchenNote && (
                    <li style={{ background: '#e0f7fa', padding: '5px', borderRadius: '4px', marginBottom: '10px', fontStyle: 'italic', color: '#006064' }}>
                        Ghi chú Bếp: {order.kitchenNote}
                    </li>
                )}

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
                                    ↳ Ghi chú KH: {item.note}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {renderActionButtons()}

            {/* Chỉ cho phép thêm Ghi chú và Hủy khi đơn hàng chưa sẵn sàng */}
            {order.status === 'RECEIVED' || order.status === 'PREPARING' ? (
                <>
                    <button
                        className="btn note"
                        onClick={handleAddNoteClick}
                        style={{marginTop: '5px'}}
                    >
                        Thêm Ghi chú (Nội bộ)
                    </button>
                    <button
                        className="btn cancel"
                        onClick={handleCancelClick}
                        style={{marginTop: '5px'}}
                    >
                        Hủy Đơn Hàng
                    </button>
                </>
            ) : null}
        </div>
    );
};


/**
 * Component KDS Chính
 */
export const KitchenDisplay = () => {
    const stompClientRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const { getItemName } = useMenu();

    useEffect(() => {
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        const fetchActiveOrders = async () => {
            try {
                // API này đã được sửa ở backend (KitchenService)
                // để chỉ lấy RECEIVED, PREPARING, READY
                const response = await axios.get(`${KITCHEN_API_URL}/api/kitchen/active-orders`);
                setOrders(response.data);
                console.log("KDS Đã tải " + response.data.length + " đơn hàng Bếp cần làm.");
            } catch (error) {
                console.error("Lỗi khi tải đơn hàng KDS:", error);
            }
        };

        client.onConnect = () => {
            console.log("KDS Đã kết nối WebSocket!");
            fetchActiveOrders();

            // Lắng nghe đơn hàng MỚI (từ Admin)
            client.subscribe(SUB_TOPIC, (message) => {
                try {
                    const newOrder = JSON.parse(message.body);
                    console.log("Đơn hàng MỚI NHẬN (WS):", newOrder);
                    setOrders(prevOrders => [...prevOrders, newOrder]);
                } catch (e) {
                    console.error("Lỗi khi parse đơn hàng:", e);
                }
            });

            // Lắng nghe cập nhật (vd: Admin hủy đơn)
            client.subscribe('/topic/admin/order-updates', (message) => {
                const updatedOrder = JSON.parse(message.body);
                console.log("KDS nhận CẬP NHẬT từ Admin:", updatedOrder);
                // Cập nhật hoặc xóa khỏi danh sách
                setOrders(prevOrders => {
                    // Nếu đơn bị Hủy hoặc chuyển trạng thái Bếp không xem
                    if (updatedOrder.status === 'CANCELLED' || updatedOrder.status === 'DELIVERING' || updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'PENDING_CONFIRMATION') {
                        return prevOrders.filter(o => o.id !== updatedOrder.id);
                    }
                    // Cập nhật các trạng thái khác (vd: PREPARING -> READY)
                    return prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
                });
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

    // --- SỬA ĐỔI: Thêm `confirmText` ---
    const handleUpdateStatus = (orderId, newStatus, confirmText) => {
        if (!window.confirm(confirmText || `Bạn có chắc muốn chuyển trạng thái?`)) {
            return;
        }
        // ... (logic gửi stomp giữ nguyên)
        const client = stompClientRef.current;
        if (client && client.connected) {
            const payload = { orderId: orderId, newStatus: newStatus };
            client.publish({
                destination: SEND_DESTINATION,
                body: JSON.stringify(payload)
            });

            // (Backend sẽ gửi WS lại, nhưng cập nhật UI ngay cho mượt)
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } else {
            console.error("STOMP client chưa kết nối.");
        }
    };

    const handleCancelOrder = async (orderId, reason) => {
        // (Xác nhận đã chuyển vào OrderCard)
        try {
            await axios.post(`${KITCHEN_API_URL}/api/kitchen/cancel-order`, {
                orderId: orderId,
                reason: reason
            });
            // (Backend sẽ gửi WS, tự động xóa)
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            alert("Đã xảy ra lỗi khi hủy đơn hàng: " + (error.response?.data || error.message));
        }
    };

    // --- SỬA ĐỔI: Đổi tên API ---
    const handleAddNote = async (orderId, note) => {
        try {
            await axios.post(`${KITCHEN_API_URL}/api/kitchen/order/${orderId}/kitchen-note`, { note });
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId ? { ...order, kitchenNote: note } : order
                )
            );
        } catch (error) {
            console.error("Lỗi khi thêm ghi chú:", error);
            alert("Lỗi khi thêm ghi chú: " + (error.response?.data || error.message));
        }
    };

    // --- SỬA ĐỔI: Lọc trạng thái KDS ---
    const receivedOrders = orders.filter(o => o.status === 'RECEIVED');
    const preparingOrders = orders.filter(o => o.status === 'PREPARING');
    const readyOrders = orders.filter(o => o.status === 'READY');
    // Bếp không cần xem đơn Hủy nữa
    // const cancelledOrders = orders.filter(o => o.status === 'CANCELLED');
    // --- KẾT THÚC SỬA ĐỔI ---

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
                        onAddNote={handleAddNote}
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
                        onAddNote={handleAddNote}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* --- SỬA ĐỔI CỘT 3: Chỉ còn 'Sẵn sàng' --- */}
            <div className="kds-column" style={{ flex: 1 }}>
                <h2 className="col-header ready">
                    Sẵn sàng ({readyOrders.length})
                </h2>
                {readyOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateStatus}
                        onCancelOrder={handleCancelOrder}
                        onAddNote={handleAddNote}
                        getItemName={getItemName}
                    />
                ))}
            </div>
            {/* --- KẾT THÚC SỬA ĐỔI --- */}


            {/* (CSS) */}
            <style>{`
                .kds-container { display: flex; flex-direction: row; gap: 15px; padding: 10px; background-color: #333; min-height: 100vh; }
                .kds-column { /* flex: 1; */ background-color: #4a4a4a; border-radius: 8px; padding: 10px; overflow-y: auto; max-height: 95vh; }
                
                .kds-sub-column { background-color: #4a4a4a; border-radius: 8px; overflow-y: auto; }
                .col-header { color: white; text-align: center; border-bottom: 2px solid; padding-bottom: 10px; margin: 0; padding: 10px; }
                
                .col-header.received { border-color: #3498db; }
                .col-header.preparing { border-color: #f1c40f; }
                .col-header.ready { border-color: #2ecc71; }
                .col-header.cancelled { border-color: #e74c3c; } 

                .order-card { background-color: #fdfdfd; border: 1px solid #ccc; border-radius: 5px; padding: 15px; margin-bottom: 10px; }
                .order-card h4 { margin-top: 0; }
                .btn { width: 100%; padding: 10px; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer; }
                .btn.prepare { background-color: #f1c40f; }
                .btn.ready { background-color: #2ecc71; }
                .btn.completed { background-color: #95a5a6; }
                .btn.cancel { background-color: #e74c3c; }
                .btn.note { background-color: #0277bd; }
                .status-cancelled { color: #e74c3c; font-weight: bold; text-align: center; }
                .status-ready { color: #2ecc71; font-weight: bold; text-align: center; font-size: 1.1em; padding: 10px 0; }
            `}</style>
        </div>
    );
};