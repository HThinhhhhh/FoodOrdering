import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;
const BACKEND_WS_URL = `${API_URL}/ws`;

const ALL_STATUSES = [
    'PENDING_CONFIRMATION', 'RECEIVED', 'PREPARING',
    'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED'
];

// (CSS)
const styles = {
    container: { padding: '20px' },
    filters: { marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#f4f4f4', padding: '8px', border: '1px solid #ddd', textAlign: 'left' },
    td: { padding: '8px', border: '1px solid #ddd', verticalAlign: 'top' },
    note: { fontSize: '0.9em', fontStyle: 'italic', color: 'gray', margin: '2px 0 0 10px', whiteSpace: 'pre-wrap' },
    internalNote: { fontSize: '0.9em', fontStyle: 'italic', color: 'blue', margin: '2px 0 0 10px', fontWeight: 'bold', whiteSpace: 'pre-wrap' },
    actionButton: { padding: '5px 10px', fontSize: '0.9em', cursor: 'pointer', border: 'none', color: 'white', borderRadius: '4px', marginRight: '5px', marginBottom: '5px' },
    btnConfirm: { backgroundColor: '#27ae60' },
    btnDeliver: { backgroundColor: '#2980b9' },
    btnComplete: { backgroundColor: '#7f8c8d' },
    btnCancel: { backgroundColor: '#c0392b' },
    btnNote: { backgroundColor: '#555' },
    btnEdit: { backgroundColor: '#f39c12' },
};

export const AdminOrderPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const stompClientRef = useRef(null);
    const navigate = useNavigate();

    // (Hàm fetchOrders, updateOrderInState, useEffect, handleFilterChange giữ nguyên)
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
            console.log("Admin Đã kết nối WebSocket!");

            client.subscribe('/topic/admin/order-updates', (message) => {
                const updatedOrder = JSON.parse(message.body);
                console.log("Admin nhận CẬP NHẬT:", updatedOrder);
                updateOrderInState(updatedOrder);
            });
        };

        client.onStompError = (frame) => console.error("Lỗi STOMP (Admin):", frame);
        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) stompClientRef.current.deactivate();
        };
    }, [statusFilter]);

    const handleFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // (Các hàm handleUpdateStatus, handleCancelOrder, handleAddDeliveryNote, handleAddEmployeeNote giữ nguyên)
    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Bạn có chắc muốn chuyển đơn hàng #${orderId} sang trạng thái [${newStatus}]?`)) {
            return;
        }

        try {
            await axios.put(`${API_URL}/api/admin/orders/${orderId}/status`, {
                orderId: orderId,
                newStatus: newStatus
            });
        } catch (err) {
            alert("Lỗi khi cập nhật trạng thái.");
        }
    };

    const handleCancelOrder = async (orderId) => {
        const reason = prompt("Bạn có chắc chắn muốn HỦY đơn hàng này không?\nNhập lý do hủy (sẽ hiển thị cho khách hàng):");
        if (reason === null) { return; }
        if (reason.trim() === "") { alert("Bạn phải nhập lý do hủy đơn hàng."); return; }

        if (window.confirm(`Bạn có chắc muốn HỦY đơn hàng #${orderId} với lý do: "${reason}"?`)) {
            try {
                await axios.post(`${API_URL}/api/kitchen/cancel-order`, {
                    orderId: orderId,
                    reason: reason
                });
            } catch (error) {
                alert("Đã xảy ra lỗi khi hủy đơn hàng: " + (error.response?.data || error.message));
            }
        }
    };

    const handleAddDeliveryNote = async (orderId, currentNote) => {
        const note = prompt("Nhập thông tin giao hàng (Shipper, SĐT, v.v.) - KHÁCH SẼ THẤY:", currentNote || "");
        if (note !== null) {
            try {
                await axios.post(`${API_URL}/api/admin/orders/${orderId}/delivery-note`, { note: note });
            } catch (err) {
                alert("Lỗi khi thêm ghi chú giao hàng.");
            }
        }
    };

    const handleAddEmployeeNote = async (orderId) => {
        const note = prompt("Thêm ghi chú nội bộ (chỉ nhân viên/admin thấy):");
        if (note && note.trim() !== "") {
            try {
                await axios.post(`${API_URL}/api/admin/orders/${orderId}/employee-note`, { note: note });
            } catch (err) {
                alert("Lỗi khi thêm ghi chú nhân viên.");
            }
        }
    };

    // (Hàm renderAdminActions giữ nguyên)
    const renderAdminActions = (order) => {
        return (
            <div>
                {order.status === 'PENDING_CONFIRMATION' && (
                    <button style={{...styles.actionButton, ...styles.btnConfirm}}
                            onClick={() => handleUpdateStatus(order.id, 'RECEIVED')}>
                        ✅ Xác nhận (Gửi Bếp)
                    </button>
                )}

                {order.status === 'READY' && (
                    <button style={{...styles.actionButton, ...styles.btnDeliver}}
                            onClick={() => {
                                const note = prompt("Nhập thông tin giao hàng (Shipper, SĐT, v.v.):", order.deliveryNote || "");
                                if (note !== null && note.trim() !== "") {
                                    axios.post(`${API_URL}/api/admin/orders/${order.id}/delivery-note`, { note })
                                        .then(() => {
                                            handleUpdateStatus(order.id, 'DELIVERING');
                                        })
                                        .catch(err => alert("Lỗi lưu ghi chú. Chưa chuyển trạng thái."));
                                } else if (note !== null) {
                                    alert("Bạn phải nhập thông tin giao hàng.");
                                }
                            }}>
                        🚚 Giao hàng
                    </button>
                )}

                {order.status === 'DELIVERING' && (
                    <button style={{...styles.actionButton, ...styles.btnComplete}}
                            onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}>
                        🏁 Hoàn thành
                    </button>
                )}

                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                    <button style={{...styles.actionButton, ...styles.btnCancel}}
                            onClick={() => handleCancelOrder(order.id)}>
                        Hủy
                    </button>
                )}

                {order.status === 'PENDING_CONFIRMATION' && (
                    <button style={{...styles.actionButton, ...styles.btnEdit}}
                            onClick={() => navigate(`/kitchen/admin/order/edit/${order.id}`)}>
                        Sửa
                    </button>
                )}

                <button style={{...styles.actionButton, ...styles.btnDeliver, opacity: 0.8}}
                        onClick={() => handleAddDeliveryNote(order.id, order.deliveryNote)}>
                    Note Giao hàng (Khách)
                </button>

                <button style={{...styles.actionButton, ...styles.btnNote}}
                        onClick={() => handleAddEmployeeNote(order.id)}>
                    Note Nội bộ (NV)
                </button>
            </div>
        );
    };


    return (
        <div style={styles.container}>
            <h2>Quản lý Đơn hàng (Tổng: {orders.length})</h2>

            <div style={styles.filters}>
                <label>Lọc theo trạng thái:</label>
                <select value={statusFilter} onChange={handleFilterChange}>
                    <option value="ALL">Tất cả</option>
                    {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {loading && <p>Đang tải đơn hàng...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>Mã Đơn / Khách hàng</th>
                    <th style={styles.th}>Chi tiết Món ăn</th>
                    <th style={styles.th}>Giao hàng / Ghi chú</th>
                    <th style={styles.th}>Tổng tiền</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {orders.map(order => (
                    <tr key={order.id} style={{background: order.status === 'PENDING_CONFIRMATION' ? '#fff8e1' : 'white'}}>
                        <td style={styles.td}>
                            <strong>#{order.id}</strong>
                            <div style={{fontSize: '0.9em'}}>{new Date(order.orderTime).toLocaleString()}</div>

                            {/* --- THÊM THÔNG TIN KHÁCH HÀNG --- */}
                            <div style={{marginTop: '10px', borderTop: '1px dashed #ccc', paddingTop: '5px'}}>
                                <div><strong>{order.customerName}</strong></div>
                                <div>{order.customerPhone}</div>
                            </div>
                            {/* --- KẾT THÚC THÊM --- */}
                        </td>
                        <td style={styles.td}>
                            {order.items.map(item => (
                                <div key={item.menuItemId}>
                                    <strong>{item.quantity} x {item.name}</strong>
                                    {item.note && <div style={styles.note}>↳ Ghi chú KH: {item.note}</div>}
                                </div>
                            ))}
                        </td>
                        <td style={styles.td}>
                            <div>{order.deliveryAddress}</div>
                            {order.shipperNote && <div style={styles.note}>Ghi chú KH (Shipper): {order.shipperNote}</div>}
                            {order.deliveryNote && <div style={{...styles.note, color: 'green', fontWeight: 'bold'}}>Note Giao hàng: {order.deliveryNote}</div>}
                            {order.kitchenNote && <div style={styles.internalNote}>Note Bếp: {order.kitchenNote}</div>}
                            {order.employeeNote && <div style={styles.internalNote}>Note NV/Admin: {order.employeeNote}</div>}
                        </td>
                        <td style={styles.td}>{formatCurrency(order.grandTotal)}</td>
                        <td style={styles.td}>
                            <strong style={{color: order.status === 'CANCELLED' ? 'red' : 'inherit'}}>
                                {order.status}
                            </strong>
                            {order.cancellationReason && <div style={{...styles.note, color: 'red'}}>{order.cancellationReason}</div>}
                        </td>
                        <td style={styles.td}>
                            {renderAdminActions(order)}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};