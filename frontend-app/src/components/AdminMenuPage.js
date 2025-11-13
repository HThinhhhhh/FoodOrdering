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
    // --- THÊM MỚI BỘ LỌC ---
    filters: {
        marginBottom: '15px',
        padding: '10px',
        background: '#f0f0f0',
        borderRadius: '5px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
    },
    // --- KẾT THÚC THÊM MỚI ---
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { background: '#f4f4f4', padding: '8px', border: '1px solid #ddd', textAlign: 'left' },
    td: { padding: '8px', border: '1px solid #ddd' },
    actionButton: { marginRight: '5px', padding: '3px 8px', cursor: 'pointer' },
    editButton: { background: 'green', color: 'white', border: 'none' },
    deleteButton: { background: 'red', color: 'white', border: 'none' },
    rating: { color: 'gold', fontWeight: 'bold', fontSize: '0.9em' }
};

// Component Star (chỉ hiển thị)
const Stars = ({ rating }) => {
    if (!rating || rating === 0) return <span style={{color: 'gray'}}>Chưa có</span>;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
        <span style={styles.rating}>
            {'★'.repeat(fullStars)}
            {halfStar ? '½' : ''}
            {'☆'.repeat(emptyStars)}
        </span>
    );
};

// Hàm lấy ngày (YYYY-MM-DD)
const getToday = () => new Date().toISOString().split('T')[0];
// Hàm lấy ngày 30 ngày trước
const get30DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
};

export const AdminMenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [reviewStats, setReviewStats] = useState(new Map());

    // --- 1. THÊM STATE CHO BỘ LỌC NGÀY ---
    const [startDate, setStartDate] = useState(get30DaysAgo());
    const [endDate, setEndDate] = useState(getToday());
    const [showAllTime, setShowAllTime] = useState(false);
    // --- KẾT THÚC THÊM STATE ---

    // --- 2. CẬP NHẬT HÀM TẢI DỮ LIỆU ---
    const fetchData = async (useDates) => {
        setLoading(true);
        try {
            // Chuẩn bị params cho API stats
            const statsParams = (useDates && startDate && endDate)
                ? { startDate, endDate }
                : {};

            const [menuRes, statsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/menu`),
                axios.get(`${API_URL}/api/admin/reviews/stats`, { params: statsParams })
            ]);

            setMenuItems(menuRes.data);

            const statsMap = new Map(
                Object.entries(statsRes.data).map(([id, stats]) => [Number(id), stats])
            );
            setReviewStats(statsMap);

        } catch (err) {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            console.error("Lỗi khi tải menu/stats admin:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        // Tải lần đầu (mặc định 30 ngày)
        fetchData(true);
    }, []);

    // --- 3. THÊM HÀM XỬ LÝ LỌC ---
    const handleFilterClick = () => {
        fetchData(!showAllTime); // Chỉ gửi ngày nếu không chọn "Tất cả"
    };

    const handleToggleAllTime = (e) => {
        const checked = e.target.checked;
        setShowAllTime(checked);
        if (checked) {
            // Nếu chọn "Tất cả", gọi API không cần ngày
            fetchData(false);
        } else {
            // Nếu bỏ chọn "Tất cả", gọi API với ngày đã chọn
            fetchData(true);
        }
    };
    // --- KẾT THÚC THÊM HÀM ---

    // (Hàm handleDelete giữ nguyên - sử dụng "Xóa mềm")
    const handleDelete = async (itemId, itemName) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA (Ngừng bán) món "${itemName}" không?`)) {
            try {
                // API DELETE này đã được sửa ở backend (MenuService)
                await axios.delete(`${API_URL}/api/admin/menu/${itemId}`);

                setMenuItems(prevItems =>
                    prevItems.map(item =>
                        item.id === itemId ? { ...item, status: 'DISCONTINUED' } : item
                    )
                );
                alert(`Đã chuyển "${itemName}" sang trạng thái Ngừng bán.`);
            } catch (err) {
                alert(`Lỗi khi xóa món ăn: ${err.message}`);
            }
        }
    };

    if (loading) return <p>Đang tải thực đơn...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={styles.container}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Quản lý Thực đơn</h2>
                <Link to="/restaurant/admin/menu/new" style={styles.linkButton}>
                    + Thêm món mới
                </Link>
            </div>

            {/* --- 4. THÊM GIAO DIỆN BỘ LỌC --- */}
            <div style={styles.filters}>
                <strong>Lọc Thống kê Đánh giá:</strong>
                <label>Từ ngày:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} disabled={showAllTime} />
                <label>Đến ngày:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} disabled={showAllTime} />
                <button onClick={handleFilterClick} disabled={loading || showAllTime}>
                    Lọc
                </button>
                <label>
                    <input type="checkbox" checked={showAllTime} onChange={handleToggleAllTime} />
                    Xem tất cả (All time)
                </label>
            </div>
            {/* --- KẾT THÚC THÊM GIAO DIỆN --- */}

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Tên món</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Giá</th>
                    {/* --- 3. THÊM CỘT MỚI --- */}
                    <th style={styles.th}>Đánh giá TB</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {menuItems.map(item => {
                    // Lấy thống kê cho món này
                    const stats = reviewStats.get(item.id);

                    return (
                        <tr key={item.id}>
                            <td style={styles.td}>{item.id}</td>
                            <td style={styles.td}>{item.name}</td>
                            <td style={styles.td}>{item.category}</td>
                            <td style={styles.td}>{formatCurrency(item.price)}</td>

                            {/* --- 4. HIỂN THỊ ĐÁNH GIÁ --- */}
                            <td style={styles.td}>
                                {stats ? (
                                    <>
                                        <Stars rating={stats.averageRating} />
                                        <div>({stats.averageRating.toFixed(1)} / {stats.reviewCount} lượt)</div>
                                    </>
                                ) : (
                                    <span style={{color: 'gray'}}>Chưa có</span>
                                )}
                            </td>
                            {/* --- KẾT THÚC --- */}

                            <td style={styles.td}>
                                    <span style={{
                                        color: item.status === 'ON_SALE' ? 'green' : (item.status === 'TEMP_OUT_OF_STOCK' ? 'orange' : 'red'),
                                        fontWeight: 'bold'
                                    }}>
                                        {item.status}
                                    </span>
                            </td>
                            <td style={styles.td}>
                                <button
                                    style={{...styles.actionButton, ...styles.editButton}}
                                    onClick={() => navigate(`/restaurant/admin/menu/edit/${item.id}`)}
                                >
                                    Sửa
                                </button>
                                {item.status !== 'DISCONTINUED' && (
                                    <button
                                        style={{...styles.actionButton, ...styles.deleteButton}}
                                        onClick={() => handleDelete(item.id, item.name)}
                                    >
                                        Xóa (Ẩn)
                                    </button>
                                )}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};