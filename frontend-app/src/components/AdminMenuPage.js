import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';
import styles from './Table.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// (Component Stars, getToday, get30DaysAgo giữ nguyên)
const Stars = ({ rating }) => {
    if (!rating || rating === 0) return <span className={styles.ratingEmpty}>Chưa có</span>;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    return (
        <span className={styles.rating}>
            {'★'.repeat(fullStars)}
            {halfStar ? '½' : ''}
            {'☆'.repeat(emptyStars)}
        </span>
    );
};
const getToday = () => new Date().toISOString().split('T')[0];
const get30DaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
};
// ...

export const AdminMenuPage = () => {
    // (Tất cả state và logic (fetchData, handleDelete) giữ nguyên)
    // ...
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [reviewStats, setReviewStats] = useState(new Map());
    const [startDate, setStartDate] = useState(get30DaysAgo());
    const [endDate, setEndDate] = useState(getToday());
    const [showAllTime, setShowAllTime] = useState(false);

    const fetchData = async (useDates) => {
        setLoading(true);
        try {
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
        fetchData(true);
    }, []);

    const handleFilterClick = () => {
        fetchData(!showAllTime);
    };

    const handleToggleAllTime = (e) => {
        const checked = e.target.checked;
        setShowAllTime(checked);
        if (checked) {
            fetchData(false);
        } else {
            fetchData(true);
        }
    };

    const handleDelete = async (itemId, itemName) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA (Ngừng bán) món "${itemName}" không?`)) {
            try {
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
    // ...


    if (loading) return <p>Đang tải thực đơn...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Quản lý Thực đơn</h2>
                <Link to="/restaurant/admin/menu/new" className={styles.linkButton}>
                    + Thêm món mới
                </Link>
            </div>

            {/* (Filter giữ nguyên) */}
            <div className={styles.filters}>
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

            <table className={styles.table}>
                <thead>
                <tr>
                    {/* --- THÊM CỘT MỚI --- */}
                    <th>Ảnh</th>
                    {/* --- KẾT THÚC --- */}
                    <th>ID</th>
                    <th>Tên món</th>
                    <th>Danh mục</th>
                    <th>Giá</th>
                    <th>Đánh giá TB</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {menuItems.map(item => {
                    const stats = reviewStats.get(item.id);

                    // (Lưu ý: API /api/admin/menu trả về model,
                    // nơi chúng ta đã đổi tên 'isPopular' thành 'popular')

                    return (
                        <tr key={item.id}>
                            {/* --- THÊM CELL MỚI --- */}
                            <td>
                                {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className={styles.menuImage} />
                                ) : (
                                    <div className={styles.menuImagePlaceholder}>Ảnh</div>
                                )}
                            </td>
                            {/* --- KẾT THÚC --- */}
                            <td>{item.id}</td>
                            <td>{item.name}</td>
                            <td>{item.category}</td>
                            <td>{formatCurrency(item.price)}</td>
                            <td>
                                {stats ? (
                                    <>
                                        <Stars rating={stats.averageRating} />
                                        <div className={styles.ratingCount}>({stats.averageRating.toFixed(1)} / {stats.reviewCount} lượt)</div>
                                    </>
                                ) : (
                                    <span className={styles.ratingEmpty}>Chưa có</span>
                                )}
                            </td>
                            <td>
                                    <span style={{
                                        color: item.status === 'ON_SALE' ? 'green' : (item.status === 'TEMP_OUT_OF_STOCK' ? 'orange' : 'red'),
                                        fontWeight: 'bold'
                                    }}>
                                        {item.status}
                                    </span>
                            </td>
                            <td>
                                <button
                                    className={styles.editButton}
                                    onClick={() => navigate(`/restaurant/admin/menu/edit/${item.id}`)}
                                >
                                    Sửa
                                </button>
                                {item.status !== 'DISCONTINUED' && (
                                    <button
                                        className={styles.deleteButton}
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