import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';
import { useMenu } from '../context/MenuContext';
import { formatCurrency } from '../utils/formatCurrency';
import styles from './DetailPage.module.css';

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${API_URL}/ws`;

// (STATUS_MAP giữ nguyên)
const STATUS_MAP = {
    PENDING_CONFIRMATION: "Đang chờ xác nhận",
    RECEIVED: "Đã xác nhận (Đang chờ bếp)",
    PREPARING: "Bếp đang chuẩn bị",
    READY: "Đã chuẩn bị xong (Chờ giao)",
    DELIVERING: "Đang giao hàng",
    COMPLETED: "Đã hoàn thành",
    CANCELLED: "Đã hủy"
};

export const OrderStatus = () => {
    // (State, hooks, useEffect... giữ nguyên)
    const { orderId } = useParams();
    const { getItemName } = useMenu();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);

    const fetchCurrentOrder = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/orders/my-orders`);
            const allOrders = response.data;
            const currentOrder = allOrders.find(o => o.id.toString() === orderId);

            if (currentOrder) {
                setOrder(currentOrder);
            }
        } catch (e) {
            console.error("Lỗi khi tải trạng thái đơn hàng:", e);
        }
        setLoading(false);
    };

    useEffect(() => {
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);

        client.onConnect = () => {
            console.log("Đã kết nối WebSocket (Trang thái Đơn hàng)!");
            fetchCurrentOrder();

            const topic = `/topic/order-status/${orderId}`;
            client.subscribe(topic, (message) => {
                const update = JSON.parse(message.body);
                console.log("Nhận được cập nhật:", update);

                setOrder(prevOrder => {
                    if (!prevOrder) {
                        fetchCurrentOrder();
                        return null;
                    }
                    return {
                        ...prevOrder,
                        status: update.newStatus || prevOrder.status,
                        cancellationReason: update.reason || prevOrder.cancellationReason,
                        deliveryNote: update.deliveryNote || prevOrder.deliveryNote
                    };
                });
            });
        };

        client.onStompError = (frame) => console.error("Lỗi STOMP:", frame);
        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
                console.log("Đã ngắt kết nối WebSocket.");
            }
        };
    }, [orderId]);
    // (Phần render logic giữ nguyên)
    if (loading) {
        return <p>Đang tải chi tiết đơn hàng...</p>;
    }
    if (!order) {
        return <p>Không tìm thấy đơn hàng.</p>;
    }
    const statusText = STATUS_MAP[order.status] || order.status;
    // ...

    return (
        <div className={styles.container}>
            {/* (Phần Status Box, Delivery Note, Address Box giữ nguyên) */}
            <h3>Mã đơn: #{order.id}</h3>
            {order.status === 'CANCELLED' ? (
                <div className={styles.statusCancelled}>
                    <h2 style={{margin: 0}}>Trạng thái: {statusText}</h2>
                    {order.cancellationReason && (
                        <p>Lý do: {order.cancellationReason}</p>
                    )}
                </div>
            ) : (
                <div className={styles.statusActive}>
                    <h2 style={{margin: 0}}>Trạng thái: {statusText}</h2>
                </div>
            )}
            {order.deliveryNote && (
                <div className={styles.deliveryNote}>
                    <strong>Thông tin giao hàng:</strong>
                    <p>{order.deliveryNote}</p>
                </div>
            )}
            {order.deliveryAddress && (
                <div className={styles.addressBox}>
                    <strong>Giao đến:</strong> {order.deliveryAddress}
                    {order.shipperNote && (
                        <div className={styles.addressBoxShipperNote}>
                            Ghi chú của bạn: {order.shipperNote}
                        </div>
                    )}
                </div>
            )}
            <hr style={{ margin: '20px 0' }} />


            {/* --- SỬA ĐỔI DANH SÁCH MÓN ĂN --- */}
            <h4>Chi tiết đơn hàng:</h4>
            <ul className={styles.orderItemsList}>
                {order.items && order.items.map((item, index) => (
                    <li key={index} className={styles.orderItem}>
                        {/* 1. Tên món và Số lượng */}
                        <div className={styles.orderItemName}>
                            {item.quantity} x {item.name || getItemName(item.menuItemId)}
                        </div>

                        {/* 2. Tùy chọn (MỚI) */}
                        {item.selectedOptionsText && (
                            <div className={styles.orderItemOptions}>
                                ↳ {item.selectedOptionsText}
                            </div>
                        )}

                        {/* 3. Ghi chú (Đã có) */}
                        {item.note && (
                            <div className={styles.orderItemNote}>
                                ↳ Ghi chú: {item.note}
                            </div>
                        )}

                        {/* 4. Thành tiền (MỚI) */}
                        <div className={styles.orderItemPrice}>
                            {formatCurrency(item.pricePerUnit * item.quantity)}
                        </div>
                    </li>
                ))}
            </ul>
            {/* --- KẾT THÚC SỬA ĐỔI --- */}


            <hr style={{ margin: '20px 0' }} />

            {/* (Phần Payment Details giữ nguyên) */}
            <div className={styles.paymentDetails}>
                <div>Tạm tính: {formatCurrency(order.subtotal)}</div>
                <div>VAT (15%): {formatCurrency(order.vatAmount)}</div>
                <div>Phí vận chuyển: {formatCurrency(order.shippingFee)}</div>
                <h3 style={{ marginTop: '10px' }}>
                    Tổng tiền: {formatCurrency(order.grandTotal)}
                </h3>
                <div>(Thanh toán bằng: {order.paymentMethod})</div>
            </div>
        </div>
    );
};