import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const API_URL = process.env.REACT_APP_API_URL;

const styles = {
    form: { maxWidth: '700px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', marginBottom: '5px', fontWeight: 'bold' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    select: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    button: { padding: '10px 20px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }
};

// Hàm chuyển đổi sang định dạng datetime-local (yyyy-MM-ddThh:mm)
const toDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
};

export const VoucherForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'FIXED_AMOUNT',
        discountValue: 0,
        maxDiscountAmount: 0, // <-- THÊM MỚI
        minimumSpend: 0,
        usageLimit: '', // Dùng chuỗi rỗng cho dễ
        startDate: toDatetimeLocal(new Date().toISOString()),
        endDate: toDatetimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditing) {
            setLoading(true);
            axios.get(`${API_URL}/api/admin/vouchers/${id}`)
                .then(response => {
                    const voucher = response.data;
                    setFormData({
                        ...voucher,
                        startDate: toDatetimeLocal(voucher.startDate),
                        endDate: toDatetimeLocal(voucher.endDate),
                        usageLimit: voucher.usageLimit === null ? '' : voucher.usageLimit,
                        minimumSpend: voucher.minimumSpend === null ? 0 : voucher.minimumSpend,
                        maxDiscountAmount: voucher.maxDiscountAmount === null ? 0 : voucher.maxDiscountAmount // <-- THÊM MỚI
                    });
                    setLoading(false);
                })
                .catch(err => setError('Không tìm thấy voucher.'));
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
            const isPercentage = formData.discountType === 'PERCENTAGE';

            const payload = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minimumSpend: formData.minimumSpend ? parseFloat(formData.minimumSpend) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
                // --- LOGIC MỚI ---
                maxDiscountAmount: (isPercentage && formData.maxDiscountAmount > 0)
                    ? parseFloat(formData.maxDiscountAmount)
                    : null,
                // --- KẾT THÚC ---
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString()
            };

            if (isEditing) {
                await axios.put(`${API_URL}/api/admin/vouchers/${id}`, payload);
            } else {
                await axios.post(`${API_URL}/api/admin/vouchers`, payload);
            }

            alert(isEditing ? 'Cập nhật thành công!' : 'Tạo voucher thành công!');
            navigate('/restaurant/admin/vouchers');

        } catch (err) {
            setError(err.response?.data || 'Lỗi khi lưu.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditing) return <p>Đang tải dữ liệu voucher...</p>;

    return (
        <form style={styles.form} onSubmit={handleSubmit}>
            <h2>{isEditing ? 'Sửa Voucher' : 'Tạo Voucher Mới'}</h2>

            <div style={styles.formGroup}>
                <label style={styles.label}>Mã Voucher:</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Mô tả:</label>
                <input type="text" name="description" value={formData.description} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Loại Giảm giá:</label>
                <select name="discountType" value={formData.discountType} onChange={handleChange} style={styles.select}>
                    <option value="FIXED_AMOUNT">Giảm Tiền Cố định (VNĐ)</option>
                    <option value="PERCENTAGE">Giảm Theo Phần trăm (%)</option>
                </select>
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Giá trị Giảm:</label>
                <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} style={styles.input} required min="0" />
                <small>{formData.discountType === 'PERCENTAGE' ? 'Nhập số % (Vd: 20 cho 20%)' : `Nhập số tiền (Vd: 30000 cho ${formatCurrency(30000)})`}</small>
            </div>

            {/* --- THÊM TRƯỜNG MỚI (HIỂN THỊ CÓ ĐIỀU KIỆN) --- */}
            {formData.discountType === 'PERCENTAGE' && (
                <div style={styles.formGroup}>
                    <label style={styles.label}>Giảm Tối Đa (VNĐ):</label>
                    <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} style={styles.input} min="0" placeholder="Bỏ trống nếu không giới hạn" />
                </div>
            )}
            {/* --- KẾT THÚC THÊM MỚI --- */}

            <div style={styles.formGroup}>
                <label style={styles.label}>Đơn hàng Tối thiểu (VNĐ):</label>
                <input type="number" name="minimumSpend" value={formData.minimumSpend} onChange={handleChange} style={styles.input} min="0" placeholder="Bỏ trống hoặc 0 nếu không yêu cầu" />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Tổng lượt Sử dụng (Usage Limit):</label>
                <input type="number" name="usageLimit" value={formData.usageLimit || ''} onChange={handleChange} style={styles.input} min="0" placeholder="Bỏ trống nếu không giới hạn" />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Ngày Bắt đầu:</label>
                <input type="datetime-local" name="startDate" value={formData.startDate} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>Ngày Kết thúc:</label>
                <input type="datetime-local" name="endDate" value={formData.endDate} onChange={handleChange} style={styles.input} required />
            </div>
            <div style={styles.formGroup}>
                <label style={styles.label}>
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    Kích hoạt?
                </label>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Đang lưu...' : (isEditing ? 'Lưu thay đổi' : 'Tạo Voucher')}
            </button>
        </form>
    );
};