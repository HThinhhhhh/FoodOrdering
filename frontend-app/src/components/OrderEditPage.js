import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

// (CSS)
const styles = {
    container: { padding: '20px', maxWidth: '700px', margin: 'auto' },
    form: { border: '1px solid #ccc', padding: '20px', borderRadius: '8px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px', minHeight: '80px', boxSizing: 'border-box' },
    button: { padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

export const OrderEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State cho các trường có thể sửa
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [shipperNote, setShipperNote] = useState('');

    // Tải dữ liệu đơn hàng
    useEffect(() => {
        setLoading(true);
        axios.get(`${API_URL}/api/admin/orders`) // Tải tất cả
            .then(response => {
                const orderToEdit = response.data.find(o => o.id.toString() === id);
                if (orderToEdit) {
                    if (orderToEdit.status !== 'PENDING_CONFIRMATION') {
                        setError('Không thể sửa đơn hàng đã được xác nhận.');
                    }
                    setOrder(orderToEdit);
                    setDeliveryAddress(orderToEdit.deliveryAddress);
                    setShipperNote(orderToEdit.shipperNote || '');
                } else {
                    setError('Không tìm thấy đơn hàng.');
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Lỗi tải dữ liệu đơn hàng.');
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                deliveryAddress,
                shipperNote
            };

            await axios.put(`${API_URL}/api/admin/orders/${id}/details`, payload);

            alert('Cập nhật chi tiết đơn hàng thành công!');
            navigate('/restaurant/admin/orders'); // Quay lại trang danh sách

        } catch (err) {
            setError(err.response?.data || 'Lỗi khi cập nhật.');
            setLoading(false);
        }
    };

    if (loading) return <p>Đang tải chi tiết đơn hàng...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!order) return null;

    return (
        <div style={styles.container}>
            <h2>Sửa chi tiết Đơn hàng #{order.id}</h2>
            <p>Bạn chỉ có thể sửa khi đơn hàng ở trạng thái "PENDING_CONFIRMATION".</p>

            <form style={styles.form} onSubmit={handleSubmit}>
                <div style={styles.formGroup}>
                    <label style={styles.label}>Địa chỉ giao hàng:</label>
                    <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        style={styles.input}
                        required
                    />
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label}>Ghi chú của Khách cho Tài xế:</label>
                    <textarea
                        value={shipperNote}
                        onChange={(e) => setShipperNote(e.target.value)}
                        style={styles.textarea}
                    />
                </div>

                {/* (Trong tương lai có thể thêm form sửa Món ăn ở đây) */}

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
            </form>
        </div>
    );
};