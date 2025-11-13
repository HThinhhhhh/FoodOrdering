import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;

// (CSS)
const styles = {
    container: { padding: '20px' },
    linkButton: {
        display: 'inline-block',
        padding: '10px 15px',
        background: 'blue',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        marginBottom: '20px'
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#f4f4f4', padding: '8px', border: '1px solid #ddd', textAlign: 'left' },
    td: { padding: '8px', border: '1px solid #ddd' },
    actionButton: { marginRight: '5px', padding: '3px 8px', cursor: 'pointer' },
    editButton: { background: 'green', color: 'white', border: 'none' },
    deleteButton: { background: 'red', color: 'white', border: 'none' }
};

export const AdminVoucherPage = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // (Hàm fetchVouchers và handleDelete giữ nguyên)
    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/admin/vouchers`);
            setVouchers(response.data);
        } catch (err) {
            setError('Không thể tải danh sách voucher.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleDelete = async (voucherId, voucherCode) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA voucher "${voucherCode}" không?`)) {
            try {
                await axios.delete(`${API_URL}/api/admin/vouchers/${voucherId}`);
                setVouchers(prev => prev.filter(v => v.id !== voucherId));
                alert(`Đã xóa "${voucherCode}".`);
            } catch (err) {
                alert(`Lỗi khi xóa voucher: ${err.message}`);
            }
        }
    };

    // --- SỬA ĐỔI HÀM NÀY ---
    const formatDiscount = (type, value, maxValue) => {
        if (type === 'PERCENTAGE') {
            let text = `${value}%`;
            if (maxValue) {
                text += ` (Tối đa ${formatCurrency(maxValue)})`;
            }
            return text;
        }
        return formatCurrency(value);
    };
    // --- KẾT THÚC SỬA ĐỔI ---

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Quản lý Mã Giảm Giá (Voucher)</h2>
                <Link to="/restaurant/admin/voucher/new" style={styles.linkButton}>
                    + Tạo Voucher Mới
                </Link>
            </div>

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>Mã (Code)</th>
                    <th style={styles.th}>Mô tả</th>
                    <th style={styles.th}>Giá trị Giảm</th>
                    <th style={styles.th}>Giảm Tối Đa</th>
                    <th style={styles.th}>Điều kiện</th>
                    <th style={styles.th}>Sử dụng</th>
                    <th style={styles.th}>Hiệu lực</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {vouchers.map(v => (
                    <tr key={v.id}>
                        <td style={styles.td}>{v.code}</td>
                        <td style={styles.td}>{v.description}</td>
                        {/* --- SỬA ĐỔI HÀM GỌI --- */}
                        <td style={styles.td}>{formatDiscount(v.discountType, v.discountValue, v.maxDiscountAmount)}</td>
                        {/* --- KẾT THÚC --- */}
                        <td style={styles.td}>{v.minimumSpend ? `Đơn tối thiểu ${formatCurrency(v.minimumSpend)}` : 'Không'}</td>
                        <td style={styles.td}>{v.currentUsage} / {v.usageLimit || '∞'}</td>
                        <td style={styles.td}>{new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}</td>
                        <td style={styles.td}>{v.isActive ? 'Đang chạy' : 'Tắt'}</td>
                        <td style={styles.td}>
                            <button
                                style={{...styles.actionButton, ...styles.editButton}}
                                onClick={() => navigate(`/restaurant/admin/voucher/edit/${v.id}`)}
                            >
                                Sửa
                            </button>
                            <button
                                style={{...styles.actionButton, ...styles.deleteButton}}
                                onClick={() => handleDelete(v.id, v.code)}
                            >
                                Xóa
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};