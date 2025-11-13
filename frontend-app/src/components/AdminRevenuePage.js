import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';

// --- 1. IMPORT CSS MODULE ---
import styles from './Table.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- 2. XÓA 'const styles = { ... }' ---
// (Đã xóa)

// (Hàm getToday giữ nguyên)
const getToday = () => new Date().toISOString().split('T')[0];

export const AdminRevenuePage = () => {
    // (State và logic (fetchData, totalRevenue, totalOrders) giữ nguyên)
    // ...
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());
    const [revenueByDate, setRevenueByDate] = useState([]);
    const [revenueByPayment, setRevenueByPayment] = useState([]);

    const totalRevenue = revenueByDate.reduce((sum, row) => sum + parseFloat(row.totalRevenue), 0);
    const totalOrders = revenueByDate.reduce((sum, row) => sum + parseInt(row.orderCount, 10), 0);

    const fetchData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        setError('');
        const params = { startDate, endDate };

        try {
            const [dateRes, paymentRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/revenue/by-date`, { params }),
                axios.get(`${API_URL}/api/admin/revenue/by-payment-method`, { params })
            ]);
            setRevenueByDate(dateRes.data);
            setRevenueByPayment(paymentRes.data);
        } catch (err) {
            setError('Không thể tải dữ liệu báo cáo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFetchClick = () => {
        fetchData();
    };
    // ...

    return (
        // --- 3. SỬ DỤNG className ---
        <div className={styles.container}>
            <h2>Báo cáo Doanh thu</h2>

            <div className={styles.filters}>
                <label>Từ ngày:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <label>Đến ngày:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <button onClick={handleFetchClick} disabled={loading}>
                    {loading ? 'Đang tải...' : 'Xem báo cáo'}
                </button>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* 1. Bảng Tổng hợp */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryBox}>
                    <h3>Tổng Doanh thu</h3>
                    <div className={`${styles.summaryValue} ${styles.revenue}`}>{formatCurrency(totalRevenue)}</div>
                </div>
                <div className={styles.summaryBox}>
                    <h3>Tổng Đơn hàng (Hoàn thành)</h3>
                    <div className={styles.summaryValue}>{totalOrders} đơn</div>
                </div>
            </div>

            <hr />

            {/* 2. Bảng Theo Phương thức Thanh toán */}
            <div style={{marginTop: '20px'}}>
                <h3>Doanh thu theo Phương thức Thanh toán</h3>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Phương thức</th>
                        <th>Số lượng Đơn</th>
                        <th>Tổng Doanh thu</th>
                    </tr>
                    </thead>
                    <tbody>
                    {revenueByPayment.map(row => (
                        <tr key={row.paymentMethod}>
                            <td>{row.paymentMethod}</td>
                            <td>{row.orderCount}</td>
                            <td>{formatCurrency(row.totalRevenue)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <hr style={{margin: '20px 0'}} />

            {/* 3. Bảng Theo Ngày */}
            <div style={{marginTop: '20px'}}>
                <h3>Doanh thu theo Ngày</h3>
                <table className={styles.table}>
                    <thead>
                    <tr>
                        <th>Ngày</th>
                        <th>Số lượng Đơn</th>
                        <th>Tổng Doanh thu</th>
                    </tr>
                    </thead>
                    <tbody>
                    {revenueByDate.map(row => (
                        <tr key={row.date}>
                            <td>{row.date}</td>
                            <td>{row.orderCount}</td>
                            <td>{formatCurrency(row.totalRevenue)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};