import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;

// (CSS)
const styles = {
    container: { padding: '20px' },
    filters: { marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    th: { background: '#f4f4f4', padding: '8px', border: '1px solid #ddd', textAlign: 'left' },
    td: { padding: '8px', border: '1px solid #ddd', verticalAlign: 'top' },
    summary: { display: 'flex', gap: '20px', marginBottom: '20px' },
    summaryBox: { padding: '20px', background: '#eee', borderRadius: '8px' }
};

// Hàm lấy ngày hôm nay (YYYY-MM-DD)
const getToday = () => new Date().toISOString().split('T')[0];

export const AdminRevenuePage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State cho bộ lọc
    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getToday());

    // State cho dữ liệu
    const [revenueByDate, setRevenueByDate] = useState([]);
    const [revenueByPayment, setRevenueByPayment] = useState([]);

    // Tổng hợp
    const totalRevenue = revenueByDate.reduce((sum, row) => sum + parseFloat(row.totalRevenue), 0);
    const totalOrders = revenueByDate.reduce((sum, row) => sum + parseInt(row.orderCount, 10), 0);

    // Hàm tải dữ liệu
    const fetchData = async () => {
        if (!startDate || !endDate) return;

        setLoading(true);
        setError('');

        const params = { startDate, endDate };

        try {
            // Gọi 2 API song song
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

    // Tải dữ liệu khi trang mount hoặc khi ngày thay đổi
    useEffect(() => {
        fetchData();
    }, []); // Chỉ tải 1 lần lúc đầu (cho ngày hôm nay)

    const handleFetchClick = () => {
        fetchData();
    };

    return (
        <div style={styles.container}>
            <h2>Báo cáo Doanh thu</h2>

            <div style={styles.filters}>
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
            <div style={styles.summary}>
                <div style={styles.summaryBox}>
                    <h3>Tổng Doanh thu</h3>
                    <div style={{fontSize: '1.5em', color: 'green'}}>{formatCurrency(totalRevenue)}</div>
                </div>
                <div style={styles.summaryBox}>
                    <h3>Tổng Đơn hàng (Hoàn thành)</h3>
                    <div style={{fontSize: '1.5em'}}>{totalOrders} đơn</div>
                </div>
            </div>

            <hr />

            {/* 2. Bảng Theo Phương thức Thanh toán */}
            <div>
                <h3>Doanh thu theo Phương thức Thanh toán</h3>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>Phương thức</th>
                        <th style={styles.th}>Số lượng Đơn</th>
                        <th style={styles.th}>Tổng Doanh thu</th>
                    </tr>
                    </thead>
                    <tbody>
                    {revenueByPayment.map(row => (
                        <tr key={row.paymentMethod}>
                            <td style={styles.td}>{row.paymentMethod}</td>
                            <td style={styles.td}>{row.orderCount}</td>
                            <td style={styles.td}>{formatCurrency(row.totalRevenue)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <hr style={{margin: '20px 0'}} />

            {/* 3. Bảng Theo Ngày */}
            <div>
                <h3>Doanh thu theo Ngày</h3>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>Ngày</th>
                        <th style={styles.th}>Số lượng Đơn</th>
                        <th style={styles.th}>Tổng Doanh thu</th>
                    </tr>
                    </thead>
                    <tbody>
                    {revenueByDate.map(row => (
                        <tr key={row.date}>
                            <td style={styles.td}>{row.date}</td>
                            <td style={styles.td}>{row.orderCount}</td>
                            <td style={styles.td}>{formatCurrency(row.totalRevenue)}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* (Đây là nơi chúng ta sẽ thêm biểu đồ sau này) */}
        </div>
    );
};