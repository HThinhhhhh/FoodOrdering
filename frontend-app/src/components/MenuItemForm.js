import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminOptionManager } from './AdminOptionManager';

// --- 1. IMPORT CSS MODULE ---
import styles from './AdminForm.module.css';

const API_URL = process.env.REACT_APP_API_URL;

const CATEGORIES = [
    'MAIN_COURSE', 'APPETIZER', 'DESSERT',
    'BEVERAGE', 'COMBO', 'OTHER'
];
const STATUSES = [
    'ON_SALE', 'TEMP_OUT_OF_STOCK', 'DISCONTINUED'
];

// --- 2. XÓA 'const styles = { ... }' ---
// (Đã xóa)


export const MenuItemForm = () => {
    // (State và logic (fetchMenuItem, handleChange, handleSubmit) giữ nguyên)
    // ...
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
        vegetarian: false, // Đổi từ isVegetarian
        spicy: false,
        popular: false,
        optionGroups: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchMenuItem = () => {
        if (isEditing) {
            setLoading(true);
            axios.get(`${API_URL}/api/admin/menu`)
                .then(response => {
                    const itemToEdit = response.data.find(item => item.id.toString() === id);
                    if (itemToEdit) {
                        setFormData({
                            ...itemToEdit,
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

    useEffect(() => {
        fetchMenuItem();
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
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                imageUrl: formData.imageUrl,
                category: formData.category,
                status: formData.status,
                vegetarian: formData.vegetarian,
                spicy: formData.spicy,
                popular: formData.popular
            };

            if (isEditing) {
                await axios.put(`${API_URL}/api/admin/menu/${id}`, payload);
            } else {
                await axios.post(`${API_URL}/api/admin/menu`, payload);
            }

            alert(isEditing ? 'Cập nhật thành công!' : 'Tạo món mới thành công!');
            navigate('/restaurant/admin/menu');

        } catch (err) {
            setError('Đã xảy ra lỗi khi lưu: ' + (err.response?.data || err.message));
        } finally {
            setLoading(false);
        }
    };
    // ...

    if (loading && isEditing && !formData.name) return <p>Đang tải dữ liệu món ăn...</p>;

    return (
        // --- 3. SỬ DỤNG className ---
        <>
            <form className={styles.formContainer} onSubmit={handleSubmit}>
                <h2>{isEditing ? 'Sửa món ăn' : 'Tạo món ăn mới'}</h2>

                <div className={styles.formGroup}>
                    <label className={styles.label}>Tên món:</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Mô tả:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} className={styles.textarea} />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Giá:</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} required min="0" />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>URL Hình ảnh:</label>
                    <input type="text" name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} className={styles.input} placeholder="https://..." />
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Danh mục:</label>
                    <select name="category" value={formData.category} onChange={handleChange} className={styles.select}>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Trạng thái:</label>
                    <select name="status" value={formData.status} onChange={handleChange} className={styles.select}>
                        {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label className={styles.label}>Thuộc tính:</label>
                    <div className={styles.checkboxGroup}>
                        <label>
                            <input type="checkbox"
                                   name="vegetarian"
                                   checked={formData.vegetarian}
                                   onChange={handleChange} />
                            Món chay
                        </label>
                        <label>
                            <input type="checkbox"
                                   name="spicy"
                                   checked={formData.spicy}
                                   onChange={handleChange} />
                            Món cay
                        </label>
                        <label>
                            <input type="checkbox"
                                   name="isPopular"
                                   checked={formData.popular}
                                   onChange={handleChange} />
                            Phổ biến
                        </label>
                    </div>
                </div>

                {error && <p className={styles.errorText}>{error}</p>}

                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi (Chỉ Thông tin Món)' : 'Tạo món mới')}
                </button>
            </form>

            {/* AdminOptionManager nằm BÊN NGOÀI form chính, nhưng vẫn dùng chung .formContainer */}
            {isEditing && (
                <div className={`${styles.formContainer} ${styles.optionsManager}`}>
                    <AdminOptionManager
                        menuItemId={id}
                        groups={formData.optionGroups}
                        onOptionChange={fetchMenuItem}
                    />
                </div>
            )}
        </>
    );
};