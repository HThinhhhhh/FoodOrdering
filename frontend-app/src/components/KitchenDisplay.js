// src/components/KitchenDisplay.js
import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';

// --- 1. IMPORT TỆP CSS MỚI ---
import './KitchenDisplay.css';

const KITCHEN_API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${KITCHEN_API_URL}/ws`;
const SUB_TOPIC = '/topic/kitchen';
const SEND_DESTINATION = '/app/kitchen/update-status';

// Component OrderCard
const OrderCard = ({ order, onUpdateStatus, onCancelOrder, onAddNote, getItemName }) => {
    const [tickedItems, setTickedItems] = useState(new Set());

    // (Tất cả logic (handlers) giữ nguyên)
    const handleToggleTick = (itemIndex) => {
        setTickedItems(prevTicked => {
            const newTicked = new Set(prevTicked);
            if (newTicked.has(itemIndex)) newTicked.delete(itemIndex);
            else newTicked.add(itemIndex);
            return newTicked;
        });
    };

    const renderActionButtons = () => {
        switch (order.status) {
            case 'RECEIVED':
                return ( <button className="btn prepare" onClick={() => onUpdateStatus(order.id, 'PREPARING', 'Bắt đầu chuẩn bị đơn này?')}>Bắt đầu chuẩn bị</button> );
            case 'PREPARING':
                return ( <button className="btn ready" onClick={() => onUpdateStatus(order.id, 'READY', 'Hoàn thành đơn này (sẵn sàng giao)?')}>Hoàn thành (Sẵn sàng)</button> );
            case 'READY':
                return <p className="status-ready">ĐÃ SẴN SÀNG (Chờ giao)</p>;
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

        if (window.confirm(`Bạn có chắc muốn HỦY đơn hàng #${order.id} với lý do: "${reason}"?`)) {
            onCancelOrder(order.id, reason);
        }
    };

    const handleAddNoteClick = () => {
        const currentNote = order.kitchenNote || "";
        const note = prompt("Thêm hoặc sửa ghi chú bếp (Admin sẽ thấy):", currentNote);
        if (note !== null) {
            onAddNote(order.id, note);
        }
    };

    return (
        <div className="order-card">
            <h4>Đơn hàng #{order.id}</h4>

            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {/* (Các li cho địa chỉ, ghi chú tài xế, ghi chú bếp giữ nguyên) */}
                <li style={{ background: '#fff8e1', padding: '5px', borderRadius: '4px', marginBottom: '10px' }}>
                    <div style={{ fontWeight: 'bold' }}>Giao đến: {order.deliveryAddress}</div>
                    {order.shipperNote && (
                        <div style={{ fontStyle: 'italic', color: '#555', marginTop: '5px' }}>
                            Ghi chú tài xế: {order.shipperNote}
                        </div>
                    )}
                </li>

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
                            <strong>{item.quantity} x {getItemName(item.menuItemId)}</strong>

                            {/* --- 2. SỬ DỤNG className --- */}
                            {item.selectedOptionsText && (
                                <div className="kds-item-options">
                                    ↳ {item.selectedOptionsText}
                                </div>
                            )}
                            {item.note && (
                                <div className="kds-item-note">
                                    ↳ Ghi chú KH: {item.note}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {renderActionButtons()}

            {order.status === 'RECEIVED' || order.status === 'PREPARING' ? (
                <>
                    <button
                        className="btn note"
                        onClick={handleAddNoteClick}
                    >
                        Thêm Ghi chú (Nội bộ)
                    </button>
                    <button
                        className="btn cancel"
                        onClick={handleCancelClick}
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
    // (Toàn bộ logic state, useEffect, handlers giữ nguyên)
    // ...
    const stompClientRef = useRef(null);
    const [orders, setOrders] = useState([]);
    const { getItemName } = useMenu();

    useEffect(() => {
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        const fetchActiveOrders = async () => {
            try {
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

            client.subscribe(SUB_TOPIC, (message) => {
                try {
                    const newOrder = JSON.parse(message.body);
                    console.log("Đơn hàng MỚI NHẬN (WS):", newOrder);
                    setOrders(prevOrders => [...prevOrders, newOrder]);
                } catch (e) {
                    console.error("Lỗi khi parse đơn hàng:", e);
                }
            });

            client.subscribe('/topic/admin/order-updates', (message) => {
                const updatedOrder = JSON.parse(message.body);
                console.log("KDS nhận CẬP NHẬT từ Admin:", updatedOrder);
                setOrders(prevOrders => {
                    if (updatedOrder.status === 'CANCELLED' || updatedOrder.status === 'DELIVERING' || updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'PENDING_CONFIRMATION') {
                        return prevOrders.filter(o => o.id !== updatedOrder.id);
                    }
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

    const handleUpdateStatus = (orderId, newStatus, confirmText) => {
        if (!window.confirm(confirmText || `Bạn có chắc muốn chuyển trạng thái?`)) {
            return;
        }

        const client = stompClientRef.current;
        if (client && client.connected) {
            const payload = { orderId: orderId, newStatus: newStatus };
            client.publish({
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

    const handleCancelOrder = async (orderId, reason) => {
        try {
            await axios.post(`${KITCHEN_API_URL}/api/kitchen/cancel-order`, {
                orderId: orderId,
                reason: reason
            });
            setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        } catch (error) {
            console.error("Lỗi khi hủy đơn hàng:", error);
            alert(error.response?.data || "Đã xảy ra lỗi khi hủy đơn hàng.");
        }
    };

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
    // ...

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
                        onCancelOrder={handleCancelOrder}
                        onAddNote={handleAddNote}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* Cột 2: Đang chuẩn bị */}
            <div className="kds-column preparing">
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
                        onCancelOrder={handleCancelOrder}
                        onAddNote={handleAddNote}
                        getItemName={getItemName}
                    />
                ))}
            </div>

            {/* --- 3. XÓA BỎ THẺ <style> --- */}
            {/* (Đã xóa) */}
        </div>
    );
};