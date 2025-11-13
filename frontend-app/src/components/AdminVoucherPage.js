import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

// --- 1. IMPORT CSS MODULE ---
import styles from './Table.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- 2. XÓA 'const styles = { ... }' ---
// (Đã xóa)

export const AdminVoucherPage = () => {
    // (State và logic (fetchVouchers, handleDelete, formatDiscount) giữ nguyên)
    // ...
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
    // ...

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        // --- 3. SỬ DỤNG className ---
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Quản lý Mã Giảm Giá (Voucher)</h2>
                <Link to="/restaurant/admin/voucher/new" className={styles.linkButton}>
                    + Tạo Voucher Mới
                </Link>
            </div>

            <table className={styles.table}>
                <thead>
                <tr>
                    <th>Mã (Code)</th>
                    <th>Mô tả</th>
                    <th>Giá trị Giảm</th>
                    {/* <th>Giảm Tối Đa</th> (Đã gộp vào cột "Giá trị Giảm") */}
                    <th>Điều kiện</th>
                    <th>Sử dụng</th>
                    <th>Hiệu lực</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {vouchers.map(v => (
                    <tr key={v.id}>
                        <td>{v.code}</td>
                        <td>{v.description}</td>
                        <td>{formatDiscount(v.discountType, v.discountValue, v.maxDiscountAmount)}</td>
                        <td>{v.minimumSpend ? `Đơn tối thiểu ${formatCurrency(v.minimumSpend)}` : 'Không'}</td>
                        <td>{v.currentUsage} / {v.usageLimit || '∞'}</td>
                        <td>{new Date(v.startDate).toLocaleDateString()} - {new Date(v.endDate).toLocaleDateString()}</td>
                        <td>{v.isActive ? 'Đang chạy' : 'Tắt'}</td>
                        <td>
                            <button
                                className={styles.editButton}
                                onClick={() => navigate(`/restaurant/admin/voucher/edit/${v.id}`)}
                            >
                                Sửa
                            </button>
                            <button
                                className={styles.deleteButton}
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