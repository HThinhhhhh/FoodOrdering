import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminOptionManager } from './AdminOptionManager'; // <-- 1. IMPORT MỚI

const API_URL = process.env.REACT_APP_API_URL;

// (Enum CATEGORIES và STATUSES giữ nguyên)
const CATEGORIES = [
    'MAIN_COURSE', 'APPETIZER', 'DESSERT',
    'BEVERAGE', 'COMBO', 'OTHER'
];
const STATUSES = [
    'ON_SALE', 'TEMP_OUT_OF_STOCK', 'DISCONTINUED'
];

// (CSS styles giữ nguyên)
const styles = {
    form: { maxWidth: '700px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    textarea: { width: '100%', padding: '8px', minHeight: '100px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    checkboxGroup: { display: 'flex', gap: '15px', alignItems: 'center' },
    button: { padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};


export const MenuItemForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        category: 'MAIN_COURSE',
        status: 'ON_SALE',
        isVegetarian: false,
        isSpicy: false,
        isPopular: false,
        optionGroups: [] // <-- 2. THÊM TRƯỜNG NÀY VÀO STATE
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- 3. TẠO HÀM TẢI DỮ LIỆU ---
    // Tách ra thành hàm riêng để AdminOptionManager có thể gọi lại
    const fetchMenuItem = () => {
        if (isEditing) {
            setLoading(true);
            // API Admin trả về MenuItem (đã bao gồm OptionGroups)
            // (Chúng ta vẫn dùng API /api/admin/menu như tệp gốc của bạn)
            axios.get(`${API_URL}/api/admin/menu`)
                .then(response => {
                    const itemToEdit = response.data.find(item => item.id.toString() === id);
                    if (itemToEdit) {
                        setFormData({
                            ...itemToEdit,
                            // Đảm bảo các giá trị null/undefined được xử lý
                            imageUrl: itemToEdit.imageUrl || '',
                            price: itemToEdit.price || 0,
                            description: itemToEdit.description || '',
                            optionGroups: itemToEdit.optionGroups || []
                        });
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
    };

    // Gọi hàm tải dữ liệu khi component mount
    useEffect(() => {
        fetchMenuItem();
    }, [id, isEditing]);
    // --- KẾT THÚC CẬP NHẬT ---

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
            // (Payload chỉ chứa các trường của MenuItem)
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                imageUrl: formData.imageUrl,
                category: formData.category,
                status: formData.status,
                isVegetarian: formData.isVegetarian,
                isSpicy: formData.isSpicy,
                isPopular: formData.isPopular
                // (Không gửi optionGroups ở đây)
            };

            if (isEditing) {
                await axios.put(`${API_URL}/api/admin/menu/${id}`, payload);
            } else {
                await axios.post(`${API_URL}/api/admin/menu`, payload);
            }

            alert(isEditing ? 'Cập nhật thành công!' : 'Tạo món mới thành công!');
            // (Nếu là Tạo mới, chúng ta nên điều hướng đến trang Sửa để thêm Options,
            //  nhưng hiện tại cứ quay về danh sách)
            navigate('/restaurant/admin/menu');

        } catch (err) {
            setError('Đã xảy ra lỗi khi lưu: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing && !formData.name) return <p>Đang tải dữ liệu món ăn...</p>;

    return (
        // Sử dụng Fragment (<>) để bọc 2 component
        <>
            <form style={styles.form} onSubmit={handleSubmit}>
                <h2>{isEditing ? 'Sửa món ăn' : 'Tạo món ăn mới'}</h2>

                {/* (Tất cả các trường input cho Tên, Mô tả, Giá, ... giữ nguyên) */}
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
                    {loading ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi (Chỉ Thông tin Món)' : 'Tạo món mới')}
                </button>
            </form>

            {/* --- 4. THÊM COMPONENT QUẢN LÝ OPTIONS (CHỈ KHI SỬA) --- */}
            {isEditing && (
                <div style={styles.form}>
                    <AdminOptionManager
                        menuItemId={id}
                        groups={formData.optionGroups}
                        onOptionChange={fetchMenuItem} // Gọi lại hàm tải dữ liệu khi có thay đổi
                    />
                </div>
            )}
        </>
    );
};