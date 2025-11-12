import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;

// (Bạn có thể tách CSS này ra tệp riêng)
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

export const AdminMenuPage = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Hàm tải tất cả món ăn (bao gồm cả món ẩn)
    const fetchAllMenuItems = async () => {
        setLoading(true);
        try {
            // Gọi API Admin, không phải API public
            const response = await axios.get(`${API_URL}/api/admin/menu`);
            setMenuItems(response.data);
        } catch (err) {
            setError('Không thể tải thực đơn. Vui lòng thử lại.');
            console.error("Lỗi khi tải menu admin:", err);
        }
        setLoading(false);
    };

    // Tải dữ liệu khi component được mount
    useEffect(() => {
        fetchAllMenuItems();
    }, []);

    // Hàm xử lý xóa món ăn
    const handleDelete = async (itemId, itemName) => {
        if (window.confirm(`Bạn có chắc chắn muốn XÓA món "${itemName}" không? Hành động này không thể hoàn tác.`)) {
            try {
                await axios.delete(`${API_URL}/api/admin/menu/${itemId}`);
                // Sau khi xóa thành công, tải lại danh sách
                // Hoặc lọc thủ công (nhanh hơn cho UI)
                setMenuItems(prevItems => prevItems.filter(item => item.id !== itemId));
                alert(`Đã xóa "${itemName}".`);
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
                <Link to="/kitchen/admin/menu/new" style={styles.linkButton}>
                    + Thêm món mới
                </Link>
            </div>

            <table style={styles.table}>
                <thead>
                <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Tên món</th>
                    <th style={styles.th}>Danh mục</th>
                    <th style={styles.th}>Giá</th>
                    <th style={styles.th}>Trạng thái</th>
                    <th style={styles.th}>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {menuItems.map(item => (
                    <tr key={item.id}>
                        <td style={styles.td}>{item.id}</td>
                        <td style={styles.td}>{item.name}</td>
                        <td style={styles.td}>{item.category}</td>
                        <td style={styles.td}>{formatCurrency(item.price)}</td>
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
                                onClick={() => navigate(`/kitchen/admin/menu/edit/${item.id}`)}
                            >
                                Sửa
                            </button>
                            <button
                                style={{...styles.actionButton, ...styles.deleteButton}}
                                onClick={() => handleDelete(item.id, item.name)}
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