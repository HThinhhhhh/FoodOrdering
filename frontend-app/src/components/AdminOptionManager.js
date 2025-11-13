import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatCurrency } from '../utils/formatCurrency';
import { useMenu } from '../context/MenuContext';

const API_URL = process.env.REACT_APP_API_URL;

// (CSS styles giữ nguyên)
const styles = {
    managerContainer: { borderTop: '2px solid #007bff', marginTop: '20px', paddingTop: '15px' },
    group: { background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px', padding: '10px', marginBottom: '10px' },
    groupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '5px 0' },
    formInline: { display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' },
    input: { padding: '5px', flex: 1, boxSizing: 'border-box', minWidth: '150px' },
    select: { padding: '5px', flex: 1, boxSizing: 'border-box', minWidth: '150px' },
    button: { padding: '5px 10px', cursor: 'pointer' },
    deleteButton: { background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px' }
};

export const AdminOptionManager = ({ menuItemId, groups, onOptionChange }) => {
    const { menuItems } = useMenu();
    const [loading, setLoading] = useState(false);

    // --- SỬA ĐỔI: Thêm selectionType vào form Group ---
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupType, setNewGroupType] = useState('SINGLE_REQUIRED'); // Mặc định
    // --- KẾT THÚC SỬA ĐỔI ---

    const [newItemForms, setNewItemForms] = useState({});

    // --- BẮT ĐẦU THÊM MỚI (State để Sửa Group) ---
    const [editingGroupId, setEditingGroupId] = useState(null); // ID của nhóm đang sửa
    const [editFormData, setEditFormData] = useState({ name: '', selectionType: '' }); // Dữ liệu form sửa
    // --- KẾT THÚC THÊM MỚI ---

    // --- SỬA ĐỔI: Gửi selectionType khi Thêm Group ---
    const handleAddGroup = async (e) => {
        e.preventDefault();
        if (!newGroupName) return;
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/admin/options/menu/${menuItemId}/groups`, {
                name: newGroupName,
                selectionType: newGroupType // <-- Gửi trường mới
            });
            onOptionChange();
            setNewGroupName('');
        } catch (err) {
            alert("Lỗi khi thêm nhóm: " + err.message);
        }
        setLoading(false);
    };
    // --- KẾT THÚC SỬA ĐỔI ---

    // (Hàm handleDeleteGroup, handleItemFormChange, handleAddItem, handleDeleteItem giữ nguyên)
    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("Bạn có chắc muốn xóa NHÓM này và TẤT CẢ tùy chọn con?")) return;
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/api/admin/options/groups/${groupId}`);
            onOptionChange();
        } catch (err) {
            alert("Lỗi khi xóa nhóm: " + err.message);
        }
        setLoading(false);
    };

    const handleItemFormChange = (groupId, field, value) => {
        setNewItemForms(prev => ({
            ...prev,
            [groupId]: {
                ...(prev[groupId] || { name: '', price: 0, linkedMenuItemId: '' }),
                [field]: value
            }
        }));
    };

    const handleAddItem = async (e, groupId) => {
        e.preventDefault();
        const form = newItemForms[groupId];
        if (!form || !form.name) return;
        const payload = {
            name: form.name,
            price: parseFloat(form.price) || 0,
            linkedMenuItemId: form.linkedMenuItemId ? parseInt(form.linkedMenuItemId, 10) : null
        };
        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/admin/options/groups/${groupId}/items`, payload);
            onOptionChange();
            setNewItemForms(prev => ({ ...prev, [groupId]: undefined }));
        } catch (err) {
            alert("Lỗi khi thêm tùy chọn: " + (err.response?.data || err.message));
        }
        setLoading(false);
    };

    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Bạn có chắc muốn xóa mục tùy chọn này?")) return;
        setLoading(true);
        try {
            await axios.delete(`${API_URL}/api/admin/options/items/${itemId}`);
            onOptionChange();
        } catch (err) {
            alert("Lỗi khi xóa tùy chọn: " + err.message);
        }
        setLoading(false);
    };

    // --- BẮT ĐẦU THÊM MỚI (Hàm xử lý Sửa Group) ---

    // Bắt đầu sửa (nhấn nút Sửa)
    const handleStartEditGroup = (group) => {
        setEditingGroupId(group.id);
        setEditFormData({ name: group.name, selectionType: group.selectionType });
    };

    // Hủy sửa
    const handleCancelEditGroup = () => {
        setEditingGroupId(null);
    };

    // Thay đổi input/select trong form sửa
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    // Lưu thay đổi (gọi API PUT)
    const handleSaveEditGroup = async (groupId) => {
        if (!editFormData.name) {
            alert("Tên nhóm không được để trống.");
            return;
        }
        setLoading(true);
        try {
            // Gọi API PUT mới
            await axios.put(`${API_URL}/api/admin/options/groups/${groupId}`, editFormData);
            setEditingGroupId(null); // Thoát chế độ edit
            onOptionChange(); // Tải lại dữ liệu (quan trọng)
        } catch (err) {
            alert("Lỗi khi cập nhật nhóm: " + (err.response?.data || err.message));
        }
        setLoading(false);
    };
    // --- KẾT THÚC THÊM MỚI ---

    const availableLinks = menuItems.filter(m => m.id !== menuItemId);

    return (
        <div style={styles.managerContainer}>
            <h3>Quản lý Tùy chọn (Options & Combos)</h3>

            {(groups || []).map(group => (
                <div key={group.id} style={styles.group}>

                    {/* --- BẮT ĐẦU SỬA ĐỔI (Hiển thị View hoặc Edit) --- */}
                    {editingGroupId === group.id ? (
                        // --- Chế độ Sửa (EDITING VIEW) ---
                        <div style={styles.groupHeader}>
                            {/* Form Sửa */}
                            <div style={{...styles.formInline, flex: 1, marginTop: 0}}>
                                <input
                                    type="text"
                                    name="name"
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    style={{...styles.input, flex: 2}}
                                />
                                <select
                                    name="selectionType"
                                    value={editFormData.selectionType}
                                    onChange={handleEditFormChange}
                                    style={{...styles.select, flex: 1.5}}
                                >
                                    <option value="SINGLE_REQUIRED">Phải chọn 1 (Vd: Size)</option>
                                    <option value="SINGLE_OPTIONAL">Được chọn 1 (Vd: Sốt)</option>
                                    <option value="MULTI_SELECT">Được chọn nhiều (Vd: Topping)</option>
                                </select>
                            </div>
                            {/* Nút Sửa */}
                            <div>
                                <button
                                    onClick={() => handleSaveEditGroup(group.id)}
                                    disabled={loading}
                                    style={{...styles.button, background: '#27ae60', color: 'white', marginRight: '5px'}}>
                                    Lưu
                                </button>
                                <button
                                    onClick={handleCancelEditGroup}
                                    disabled={loading}
                                    style={{...styles.button, background: '#7f8c8d', color: 'white'}}>
                                    Hủy
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- Chế độ Xem (VIEW MODE - như cũ, nhưng thêm nút Sửa) ---
                        <div style={styles.groupHeader}>
                            <div>
                                <strong>{group.name}</strong>
                                <small style={{color: '#555', marginLeft: '10px'}}>
                                    [Quy tắc: {group.selectionType}]
                                </small>
                            </div>
                            <div>
                                <button
                                    onClick={() => handleStartEditGroup(group)}
                                    disabled={loading}
                                    style={{...styles.button, background: '#f39c12', color: 'white', marginRight: '5px'}}>
                                    Sửa Tên/Quy tắc
                                </button>
                                <button
                                    onClick={() => handleDeleteGroup(group.id)}
                                    disabled={loading}
                                    style={{...styles.button, ...styles.deleteButton}}>
                                    Xóa Nhóm
                                </button>
                            </div>
                        </div>
                    )}
                    {/* --- KẾT THÚC SỬA ĐỔI --- */}

                    {/* (Danh sách item con và form thêm item con giữ nguyên) */}
                    <div>
                        {(group.options || []).map(item => (
                            <div key={item.id} style={styles.item}>
                                <span>
                                    {item.name} (+{formatCurrency(item.price)})
                                    {item.linkedMenuItemId && (
                                        <small style={{color: 'blue', marginLeft: '10px'}}>
                                            [Link: {menuItems.find(m => m.id === item.linkedMenuItemId)?.name || '...'} (ID: {item.linkedMenuItemId})]
                                        </small>
                                    )}
                                </span>
                                <button
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={loading}
                                    style={{...styles.button, ...styles.deleteButton, fontSize: '0.8em'}}>
                                    X
                                </button>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={(e) => handleAddItem(e, group.id)} style={styles.formInline}>
                        <input
                            type="text"
                            placeholder="Tên tùy chọn (Vd: Size L)"
                            style={styles.input}
                            value={newItemForms[group.id]?.name || ''}
                            onChange={(e) => handleItemFormChange(group.id, 'name', e.target.value)}
                        />
                        <input
                            type="number"
                            placeholder="Giá cộng thêm"
                            style={{...styles.input, flex: 0.5}}
                            value={newItemForms[group.id]?.price || 0}
                            onChange={(e) => handleItemFormChange(group.id, 'price', e.target.value)}
                        />
                        <select
                            style={styles.input}
                            value={newItemForms[group.id]?.linkedMenuItemId || ''}
                            onChange={(e) => handleItemFormChange(group.id, 'linkedMenuItemId', e.target.value)}
                        >
                            <option value="">[Không liên kết (chỉ cộng tiền)]</option>
                            {availableLinks.map(m => (
                                <option key={m.id} value={m.id}>[Link Combo: {m.name}]</option>
                            ))}
                        </select>
                        <button type="submit" style={styles.button} disabled={loading}>Thêm</button>
                    </form>
                </div>
            ))}

            {/* --- SỬA ĐỔI: Form thêm Group mới --- */}
            <form onSubmit={handleAddGroup} style={{...styles.formInline, marginTop: '20px', background: '#eee', padding: '10px'}}>
                <input
                    type="text"
                    placeholder="Tên nhóm mới (Vd: Chọn Size)"
                    style={styles.input}
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                />
                {/* Thêm ô chọn Quy tắc */}
                <select
                    style={styles.select} // <-- Dùng style 'select'
                    value={newGroupType}
                    onChange={(e) => setNewGroupType(e.target.value)}
                >
                    <option value="SINGLE_REQUIRED">Phải chọn 1 (Vd: Size)</option>
                    <option value="SINGLE_OPTIONAL">Được chọn 1 (Vd: Sốt)</option>
                    <option value="MULTI_SELECT">Được chọn nhiều (Vd: Topping)</option>
                </select>
                <button type="submit" style={{...styles.button, background: 'green', color: 'white'}} disabled={loading}>
                    Thêm Nhóm Tùy chọn
                </button>
            </form>
            {/* --- KẾT THÚC SỬA ĐỔI --- */}
        </div>
    );
};