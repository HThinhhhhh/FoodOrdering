import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL;

// Lấy Enum từ backend (chúng ta phải định nghĩa chúng ở đây)
const CATEGORIES = [
    'MAIN_COURSE',
    'APPETIZER',
    'DESSERT',
    'BEVERAGE',
    'COMBO',
    'OTHER'
];
const STATUSES = [
    'ON_SALE',
    'TEMP_OUT_OF_STOCK',
    'DISCONTINUED'
];

// (CSS cho Form)
const styles = {
    form: { maxWidth: '700px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px', minHeight: '100px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    checkboxGroup: { display: 'flex', gap: '15px', alignItems: 'center' },
    button: { padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};


export const MenuItemForm = () => {
    const { id } = useParams(); // Lấy 'id' từ URL (nếu có, là chế độ Sửa)
    const navigate = useNavigate();
    const isEditing = Boolean(id); // true nếu là Sửa, false nếu là Tạo mới

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'MAIN_COURSE', // Giá trị mặc định
        status: 'ON_SALE',       // Giá trị mặc định
        isVegetarian: false,
        isSpicy: false,
        isPopular: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            // Nếu là chế độ Sửa, tải dữ liệu món ăn đó
            // (Hiện tại backend chưa có /api/admin/menu/{id},
            //  nên chúng ta tải TẤT CẢ và lọc ra)
            axios.get(`${API_URL}/api/admin/menu`)
                .then(response => {
                    const itemToEdit = response.data.find(item => item.id.toString() === id);
                    if (itemToEdit) {
                        setFormData(itemToEdit);
                    } else {
                        setError('Không tìm thấy món ăn.');
                    }
                    setLoading(false);
                })
                .catch(err => {
                    setError('Lỗi tải dữ liệu món ăn.');
                    setLoading(false);
                });
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                ...formData,
                price: parseFloat(formData.price) // Đảm bảo giá là số
            };

            if (isEditing) {
                // Chế độ Sửa (PUT)
                await axios.put(`${API_URL}/api/admin/menu/${id}`, payload);
            } else {
                // Chế độ Tạo mới (POST)
                await axios.post(`${API_URL}/api/admin/menu`, payload);
            }

            alert(isEditing ? 'Cập nhật thành công!' : 'Tạo món mới thành công!');
            navigate('/kitchen/admin/menu'); // Quay lại trang danh sách

        } catch (err) {
            setError('Đã xảy ra lỗi khi lưu: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Đang tải dữ liệu món ăn...</p>;

    return (
        <form style={styles.form} onSubmit={handleSubmit}>
            <h2>{isEditing ? 'Sửa món ăn' : 'Tạo món ăn mới'}</h2>

            <div style={styles.formGroup}>
                <label style={styles.label}>Tên món:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Mô tả:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} style={styles.textarea} />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Giá:</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} style={styles.input} required min="0" />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>URL Hình ảnh:</label>
                <input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} style={styles.input} placeholder="https://..." />
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Danh mục:</label>
                <select name="category" value={formData.category} onChange={handleChange} style={styles.select}>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Trạng thái:</label>
                <select name="status" value={formData.status} onChange={handleChange} style={styles.select}>
                    {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                </select>
            </div>

            <div style={styles.formGroup}>
                <label style={styles.label}>Thuộc tính:</label>
                <div style={styles.checkboxGroup}>
                    <label>
                        <input type="checkbox" name="isVegetarian" checked={formData.isVegetarian} onChange={handleChange} />
                        Món chay
                    </label>
                    <label>
                        <input type="checkbox" name="isSpicy" checked={formData.isSpicy} onChange={handleChange} />
                        Món cay
                    </label>
                    <label>
                        <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} />
                        Phổ biến
                    </label>
                </div>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi' : 'Tạo món mới')}
            </button>
        </form>
    );
};