import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';

// --- 1. IMPORT CHART.JS ---
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// --- 2. ĐĂNG KÝ CÁC THÀNH PHẦN BIỂU ĐỒ ---
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const API_URL = process.env.REACT_APP_API_URL;

// (CSS styles giữ nguyên)
const styles = {
    container: { padding: '20px' },
    header: { marginBottom: '20px' },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    statBox: {
        background: '#f4f4f4',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center'
    },
    statValue: {
        fontSize: '2.5em',
        fontWeight: 'bold',
        margin: '0 0 5px 0'
    },
    statLabel: {
        fontSize: '1em',
        color: '#555'
    },
    mainContent: {
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '20px' // Thêm margin
    },
    // --- THÊM STYLE MỚI CHO BIỂU ĐỒ MÓN ĂN ---
    bottomContent: {
        background: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
    },
    // ---
    notifications: {
        background: '#fff8e1',
        border: '1px solid #ffe082',
        borderRadius: '8px',
        padding: '20px',
    },
    notificationItem: {
        borderBottom: '1px solid #eee',
        padding: '10px 0',
        display: 'flex',
        alignItems: 'center'
    },
    notificationCount: {
        fontSize: '1.5em',
        fontWeight: 'bold',
        color: '#c0392b',
        marginRight: '15px',
        minWidth: '30px',
        textAlign: 'center'
    },
    charts: {
        background: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
    }
};

// --- HÀM HELPER CHO MÀU SẮC BIỂU ĐỒ ---
const chartColors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6',
    '#34495e', '#1abc9c', '#e67e22', '#bdc3c7', '#7f8c8d'
];

const statusColors = {
    PENDING_CONFIRMATION: '#f1c40f',
    RECEIVED: '#3498db',
    PREPARING: '#e67e22',
    READY: '#1abc9c',
    DELIVERING: '#9b59b6',
    COMPLETED: '#2ecc71',
    CANCELLED: '#e74c3c',
};

// Hàm lấy ngày 7 ngày trước (YYYY-MM-DD)
const get7DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
};
const getToday = () => new Date().toISOString().split('T')[0];
// --- KẾT THÚC HELPER ---


export const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [notifications, setNotifications] = useState([]);

    // --- 3. THÊM STATE CHO DỮ LIỆU BIỂU ĐỒ ---
    const [revenueChartData, setRevenueChartData] = useState(null);
    const [topItemsChartData, setTopItemsChartData] = useState(null);
    const [statusChartData, setStatusChartData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Lấy ngày 7 ngày trước để lọc doanh thu
                const startDate = get7DaysAgo();
                const endDate = getToday();

                // --- 4. GỌI TẤT CẢ API (4 API) ---
                const [statsRes, notificationsRes, revenueRes, topItemsRes, statusRes] = await axios.all([
                    axios.get(`${API_URL}/api/admin/dashboard/stats`),
                    axios.get(`${API_URL}/api/admin/dashboard/notifications`),
                    // Tái sử dụng API từ trang Báo cáo Doanh thu
                    axios.get(`${API_URL}/api/admin/revenue/by-date`, { params: { startDate, endDate } }),
                    axios.get(`${API_URL}/api/admin/dashboard/top-items`),
                    axios.get(`${API_URL}/api/admin/dashboard/order-status-distribution`)
                ]);

                setStats(statsRes.data);
                setNotifications(notificationsRes.data);

                // --- 5. XỬ LÝ DỮ LIỆU BIỂU ĐỒ ---

                // Biểu đồ Doanh thu (Line)
                const revenueData = revenueRes.data;
                setRevenueChartData({
                    labels: revenueData.map(d => d.date),
                    datasets: [{
                        label: 'Doanh thu (VNĐ)',
                        data: revenueData.map(d => d.totalRevenue),
                        borderColor: '#2ecc71',
                        backgroundColor: 'rgba(46, 204, 113, 0.5)',
                        fill: true,
                        tension: 0.1
                    }]
                });

                // Biểu đồ Món bán chạy (Bar)
                const topItemsData = topItemsRes.data;
                setTopItemsChartData({
                    labels: topItemsData.map(d => d.label),
                    datasets: [{
                        label: 'Số lượng bán',
                        data: topItemsData.map(d => d.count),
                        backgroundColor: chartColors,
                    }]
                });

                // Biểu đồ Trạng thái (Doughnut)
                const statusData = statusRes.data;
                setStatusChartData({
                    labels: statusData.map(d => d.label),
                    datasets: [{
                        label: 'Số lượng',
                        data: statusData.map(d => d.count),
                        backgroundColor: statusData.map(d => statusColors[d.label] || '#bdc3c7'),
                        hoverOffset: 4
                    }]
                });

            } catch (err) {
                console.error("Lỗi khi tải dữ liệu dashboard:", err);
                setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) return <p>Đang tải dữ liệu Dashboard...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!stats) return <p>Không có dữ liệu.</p>;

    return (
        <div style={styles.container}>
            <h2 style={styles.header}>Tổng quan</h2>

            {/* === 1. THỐNG KÊ TỔNG QUAN (Giữ nguyên) === */}
            <div style={styles.statsGrid}>
                {/* (4 thẻ stats giữ nguyên) */}
                <div style={styles.statBox}>
                    <div style={{...styles.statValue, color: 'green'}}>
                        {formatCurrency(stats.totalRevenue || 0)}
                    </div>
                    <div style={styles.statLabel}>Tổng doanh thu (Đã hoàn thành)</div>
                </div>
                <div style={styles.statBox}>
                    <div style={styles.statValue}>
                        {stats.totalCompletedOrders || 0}
                    </div>
                    <div style={styles.statLabel}>Đơn đã hoàn thành</div>
                </div>
                <div style={styles.statBox}>
                    <div style={{...styles.statValue, color: 'orange'}}>
                        {stats.totalPendingOrders || 0}
                    </div>
                    <div style={styles.statLabel}>Đơn đang chờ xử lý</div>
                </div>
                <div style={styles.statBox}>
                    <div style={styles.statValue}>
                        {stats.totalCustomers || 0}
                    </div>
                    <div style={styles.statLabel}>Tổng khách hàng</div>
                </div>
            </div>

            {/* === 2. BIỂU ĐỒ VÀ THÔNG BÁO (SỬA LẠI) === */}
            <div style={styles.mainContent}>

                {/* Khu vực Biểu đồ Doanh thu (Line) */}
                <div style={styles.charts}>
                    <h3>Doanh thu (7 ngày qua)</h3>
                    {revenueChartData ? (
                        <Line options={{ responsive: true }} data={revenueChartData} />
                    ) : (
                        <p>Đang tải...</p>
                    )}
                </div>

                {/* Khu vực Thông báo nhanh (Giữ nguyên) */}
                <div style={styles.notifications}>
                    <h3 style={{ marginTop: 0 }}>Thông báo nhanh</h3>
                    {notifications.length === 0 ? (
                        <p>Không có thông báo mới.</p>
                    ) : (
                        notifications.map((n, index) => (
                            <div key={index} style={styles.notificationItem}>
                                <div style={styles.notificationCount}>{n.count}</div>
                                <div>Có <strong>{n.count}</strong> {n.message}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- 6. THÊM KHU VỰC BIỂU ĐỒ BÊN DƯỚI --- */}
            <div style={styles.mainContent}>
                {/* Biểu đồ Món bán chạy (Bar) */}
                <div style={styles.bottomContent}>
                    <h3>Top 10 Món bán chạy (đã hoàn thành)</h3>
                    {topItemsChartData ? (
                        <Bar options={{ responsive: true, indexAxis: 'y' }} data={topItemsChartData} />
                    ) : (
                        <p>Đang tải...</p>
                    )}
                </div>

                {/* Biểu đồ Trạng thái (Doughnut) */}
                <div style={styles.bottomContent}>
                    <h3>Phân phối Trạng thái Đơn hàng</h3>
                    {statusChartData ? (
                        <Doughnut options={{ responsive: true }} data={statusChartData} />
                    ) : (
                        <p>Đang tải...</p>
                    )}
                </div>
            </div>

        </div>
    );
};