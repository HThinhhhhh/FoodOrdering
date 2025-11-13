import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

// --- 1. IMPORT CSS MODULE ---
import styles from './AdminOrderPage.module.css';

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${API_URL}/ws`;

const ALL_STATUSES = [
    'PENDING_CONFIRMATION', 'RECEIVED', 'PREPARING',
    'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED'
];

// --- 2. XÓA BỎ 'const styles = { ... }' ---
// (Đã xóa)

export const AdminOrderPage = () => {
    // (State và logic hooks giữ nguyên)
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const stompClientRef = useRef(null);
    const navigate = useNavigate();

    // (Tất cả các hàm xử lý (handlers) và useEffect giữ nguyên)
    // ...
    const fetchOrders = async (filter) => {
        setLoading(true);
        try {
            const params = (filter && filter !== 'ALL') ? { status: filter } : {};
            const response = await axios.get(`${API_URL}/api/admin/orders`, { params });
            setOrders(response.data);
        } catch (err) {
            setError('Không thể tải đơn hàng.');
        }
        setLoading(false);
    };

    const updateOrderInState = (updatedOrder) => {
        setOrders(prevOrders => {
            const index = prevOrders.findIndex(o => o.id === updatedOrder.id);
            const matchesFilter = !statusFilter || statusFilter === 'ALL' || statusFilter === updatedOrder.status;
            if (index > -1) {
                if (matchesFilter) {
                    const newOrders = [...prevOrders];
                    newOrders[index] = updatedOrder;
                    return newOrders.sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
                } else {
                    return prevOrders.filter(o => o.id !== updatedOrder.id);
                }
            } else if (matchesFilter) {
                return [updatedOrder, ...prevOrders].sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
            }
            return prevOrders;
        });
    };

    useEffect(() => {
        fetchOrders(statusFilter);
        const client = new Client();
        client.webSocketFactory = () => new SockJS(BACKEND_WS_URL);
        client.onConnect = () => {
            client.subscribe('/topic/admin/order-updates', (message) => {
                updateOrderInState(JSON.parse(message.body));
            });
        };
        client.activate();
        stompClientRef.current = client;
        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng #${orderId} sang trạng thái [${newStatus}]?`)) return;
        try {
            await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, { orderId, newStatus });
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái.");
        }
    };

    const handleCancelOrder = async (orderId) => {
        const reason = prompt("Nhập lý do hủy:");
        if (!reason) return;
        if (window.confirm(`Bạn có chắc muốn HỦY đơn hàng #${orderId} với lý do: "${reason}"?`)) {
            try {
                await axios.post(`${API_URL}/api/kitchen/cancel-order`, { orderId, reason });
            } catch (error) {
                alert(error.response?.data || "Lỗi khi hủy đơn hàng.");
            }
        }
    };

    const handleAddDeliveryNote = async (orderId, currentNote) => {
        const note = prompt("Nhập thông tin giao hàng (KHÁCH SẼ THẤY):", currentNote || "");
        if (note !== null) {
            try {
                await axios.post(`${API_URL}/api/admin/orders/${orderId}/delivery-note`, { note });
            } catch (err) {
                alert(err.response?.data || "Lỗi khi thêm ghi chú giao hàng.");
            }
        }
    };

    const handleAddEmployeeNote = async (orderId) => {
        const note = prompt("Thêm ghi chú nội bộ (chỉ nhân viên/admin thấy):");
        if (note && note.trim() !== "") {
            try {
                await axios.post(`${API_URL}/api/admin/orders/${orderId}/employee-note`, { note });
            } catch (err) {
                alert("Lỗi khi thêm ghi chú nhân viên.");
            }
        }
    };
    // ...

    // --- 3. SỬA ĐỔI RENDER ACTIONS (dùng className) ---
    const renderAdminActions = (order) => {
        const isLocked = order.status === 'COMPLETED' || order.status === 'CANCELLED';
        const isDelivering = order.status === 'DELIVERING';
        return (
            <div>
                {order.status === 'PENDING_CONFIRMATION' && (
                    <button className={styles.btnConfirm}
                            onClick={() => handleUpdateStatus(order.id, 'RECEIVED')}>
                        ✅ Xác nhận (Gửi Bếp)
                    </button>
                )}
                {order.status === 'READY' && (
                    <button className={styles.btnDeliver}
                            onClick={() => {
                                const note = prompt("Nhập thông tin giao hàng (Shipper, SĐT, v.v.):", order.deliveryNote || "");
                                if (note !== null && note.trim() !== "") {
                                    axios.post(`${API_URL}/api/admin/orders/${order.id}/delivery-note`, { note })
                                        .then(() => handleUpdateStatus(order.id, 'DELIVERING'))
                                        .catch(err => alert(err.response?.data || "Lỗi lưu ghi chú."));
                                } else if (note !== null) alert("Bạn phải nhập thông tin giao hàng.");
                            }}>
                        🚚 Giao hàng
                    </button>
                )}
                {isDelivering && (
                    <button className={styles.btnComplete}
                            onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}>
                        🏁 Hoàn thành
                    </button>
                )}
                {!isLocked && (
                    <button className={styles.btnCancel}
                            onClick={() => handleCancelOrder(order.id)}>
                        Hủy
                    </button>
                )}
                {order.status === 'PENDING_CONFIRMATION' && (
                    <button className={styles.btnEdit}
                            onClick={() => navigate(`/restaurant/admin/order/edit/${order.id}`)}>
                        Sửa
                    </button>
                )}
                {!isDelivering && !isLocked && (
                    <button className={`${styles.btnDeliver} ${styles.actionButton}`}
                            style={{opacity: 0.8}} // Giữ lại style này vì nó là tạm thời
                            onClick={() => handleAddDeliveryNote(order.id, order.deliveryNote)}>
                        Note Giao hàng (Khách)
                    </button>
                )}
                <button className={styles.btnNote}
                        onClick={() => handleAddEmployeeNote(order.id)}>
                    Note Nội bộ (NV)
                </button>
            </div>
        );
    };

    return (
        // --- 4. SỬ DỤNG className ---
        <div className={styles.container}>
            <h2>Quản lý Đơn hàng (Tổng: {orders.length})</h2>

            <div className={styles.filters}>
                <label>Lọc theo trạng thái:</label>
                <select value={statusFilter} onChange={handleFilterChange}>
                    <option value="ALL">Tất cả</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading && <p>Đang tải đơn hàng...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Mã Đơn / Khách hàng</th>
                    <th>Chi tiết Món ăn</th>
                    <th>Giao hàng / Ghi chú</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id} className={order.status === 'PENDING_CONFIRMATION' ? styles.pendingRow : ''}>
                        <td>
                            <strong>#{order.id}</strong>
                            <div style={{fontSize: '0.9em'}}>{new Date(order.orderTime).toLocaleString()}</div>
                            <div className={styles.customerInfo}>
                                <div><strong>{order.customerName}</strong></div>
                                <div>{order.customerPhone}</div>
                            </div>
                        </td>
                        <td>
                            {order.items.map((item, index) => (
                                <div key={index} className={styles.orderItem}>
                                    <strong>{item.quantity} x {item.name}</strong>
                                    {item.selectedOptionsText && (
                                        <div className={styles.options}>
                                            ↳ {item.selectedOptionsText}
                                        </div>
                                    )}
                                    {item.note && <div className={styles.note}>↳ Ghi chú KH: {item.note}</div>}
                                </div>
                            ))}
                        </td>
                        <td>
                            <div>{order.deliveryAddress}</div>
                            {order.shipperNote && <div className={styles.note}>Ghi chú KH (Shipper): {order.shipperNote}</div>}
                            {order.deliveryNote && <div className={styles.deliveryNote}>Note Giao hàng: {order.deliveryNote}</div>}
                            {order.kitchenNote && <div className={styles.internalNote}>Note Bếp: {order.kitchenNote}</div>}
                            {order.employeeNote && <div className={styles.internalNote}>Note NV/Admin: {order.employeeNote}</div>}
                        </td>
                        <td>{formatCurrency(order.grandTotal)}</td>
                        <td className={order.status === 'CANCELLED' ? styles.statusCellCancelled : styles.statusCell}>
                            <strong>{order.status}</strong>
                            {order.cancellationReason && <div className={styles.cancellationReason}>{order.cancellationReason}</div>}
                        </td>
                        <td className={styles.actionsCell}>
                            {renderAdminActions(order)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};