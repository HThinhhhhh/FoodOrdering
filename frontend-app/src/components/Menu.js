// src/components/Menu.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useMenu } from '../context/MenuContext';
import { BigDecimal } from 'bigdecimal'; // <-- 1. IMPORT BIGDECIMAL

const API_URL = process.env.REACT_APP_API_URL;

// --- COMPONENT MODAL (ĐÃ CẬP NHẬT LOGIC) ---
const OptionModal = ({ item, onClose, onAddToCart }) => {

    // --- SỬA ĐỔI: Khởi tạo State dựa trên Quy tắc ---
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const initialSelections = new Map();
        (item.optionGroups || []).forEach(group => {
            if (group.selectionType === 'SINGLE_REQUIRED' && group.options && group.options.length > 0) {
                // Tự động chọn mục đầu tiên (thường là "mặc định") cho nhóm BẮT BUỘC
                initialSelections.set(group.id, group.options[0].id);
            }
            if (group.selectionType === 'MULTI_SELECT') {
                // Đối với checkbox, giá trị là một Set các ID
                initialSelections.set(group.id, new Set());
            }
            // (SINGLE_OPTIONAL mặc định là không chọn gì - null)
        });
        return initialSelections;
    });
    // --- KẾT THÚC SỬA ĐỔI ---

    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [validationError, setValidationError] = useState('');

    // --- SỬA ĐỔI: Tính toán giá tiền (Hỗ trợ cả Radio và Checkbox) ---
    let currentPrice = new BigDecimal(item.price.toString()); // Giá gốc
    let optionsText = []; // Chuỗi text cho Bếp

    (item.optionGroups || []).forEach(group => {
        const selection = selectedOptions.get(group.id);
        if (!selection) return;

        if (group.selectionType === 'MULTI_SELECT') {
            // selection là một Set (Vd: {3, 4})
            selection.forEach(selectedItemId => {
                const selectedItem = group.options.find(opt => opt.id === selectedItemId);
                if (selectedItem) {
                    currentPrice = currentPrice.add(new BigDecimal(selectedItem.price.toString()));
                    optionsText.push(selectedItem.name);
                }
            });
        } else {
            // selection là một ID (Vd: 2)
            const selectedItem = group.options.find(opt => opt.id === selection);
            if (selectedItem) {
                currentPrice = currentPrice.add(new BigDecimal(selectedItem.price.toString()));
                optionsText.push(selectedItem.name);
            }
        }
    });

    const finalPricePerUnit = currentPrice.doubleValue(); // Chuyển về số
    const selectedOptionsText = optionsText.join(', ');
    // --- KẾT THÚC TÍNH TOÁN ---

    // --- SỬA ĐỔI: Xử lý chọn (Hỗ trợ cả Radio và Checkbox) ---
    const handleSelectOption = (groupId, optionItemId, selectionType) => {
        setValidationError(''); // Xóa lỗi cũ
        setSelectedOptions(prev => {
            const newSelections = new Map(prev);

            if (selectionType === 'MULTI_SELECT') {
                const currentSet = newSelections.get(groupId) || new Set();
                if (currentSet.has(optionItemId)) {
                    currentSet.delete(optionItemId);
                } else {
                    currentSet.add(optionItemId);
                }
                newSelections.set(groupId, new Set(currentSet)); // Cập nhật Set
            } else {
                // (SINGLE_REQUIRED hoặc SINGLE_OPTIONAL)
                newSelections.set(groupId, optionItemId); // Chỉ gán ID
            }
            return newSelections;
        });
    };
    // --- KẾT THÚC SỬA ĐỔI ---

    // Xử lý khi bấm nút "Thêm vào giỏ"
    const handleConfirmAdd = () => {
        setValidationError('');
        // --- THÊM VALIDATION ---
        for (const group of (item.optionGroups || [])) {
            if (group.selectionType === 'SINGLE_REQUIRED') {
                if (!selectedOptions.has(group.id) || selectedOptions.get(group.id) === null) {
                    setValidationError(`Vui lòng chọn một mục cho "${group.name}".`);
                    return;
                }
            }
        }
        // --- KẾT THÚC VALIDATION ---

        const itemToAdd = {
            ...item,
            finalPrice: finalPricePerUnit,
            selectedOptionsText: selectedOptionsText,
            quantity: quantity,
            note: note,
        };
        onAddToCart(itemToAdd);
        onClose();
    };

    // (CSS cho Modal và Overlay giữ nguyên)
    const modalStyle = {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white', padding: '20px',
        border: '1px solid #ccc', borderRadius: '8px', zIndex: 1001,
        width: '90%', maxWidth: '500px',
        maxHeight: '80vh', overflowY: 'auto',
        boxSizing: 'border-box'
    };
    const overlayStyle = {
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000
    };
    const groupStyle = { margin: '10px 0', borderTop: '1px solid #eee', paddingTop: '10px' };

    return (
        <>
            <div style={overlayStyle} onClick={onClose}></div>
            <div style={modalStyle}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                {/* Lặp qua các nhóm tùy chọn */}
                {(item.optionGroups || []).map(group => (
                    <div key={group.id} style={groupStyle}>
                        <strong>{group.name}</strong>
                        {/* --- THÊM LOGIC RENDER (RADIO/CHECKBOX) --- */}
                        <div>
                            {group.options.map(option => {
                                const isRadio = group.selectionType === 'SINGLE_REQUIRED' || group.selectionType === 'SINGLE_OPTIONAL';
                                const isChecked = isRadio
                                    ? (selectedOptions.get(group.id) === option.id)
                                    : (selectedOptions.get(group.id)?.has(option.id) || false);

                                return (
                                    <label key={option.id} style={{display: 'block', margin: '5px 0'}}>
                                        <input
                                            type={isRadio ? "radio" : "checkbox"}
                                            name={`group-${group.id}`}
                                            checked={isChecked}
                                            onChange={() => handleSelectOption(group.id, option.id, group.selectionType)}
                                        />
                                        {option.name}
                                        ( +{formatCurrency(option.price)} )
                                    </label>
                                );
                            })}
                        </div>
                        {/* --- KẾT THÚC LOGIC RENDER --- */}
                    </div>
                ))}

                {/* Ghi chú */}
                <div style={groupStyle}>
                    <label><strong>Ghi chú (cho món này):</strong></label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        style={{width: '100%', minHeight: '60px', marginTop: '5px', boxSizing: 'border-box'}}
                    />
                </div>

                {/* Số lượng */}
                <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px'}}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>

                {/* Hiển thị lỗi Validation */}
                {validationError && <p style={{color: 'red'}}>{validationError}</p>}

                {/* Nút xác nhận */}
                <button onClick={handleConfirmAdd} style={{width: '100%', padding: '10px', background: 'green', color: 'white', marginTop: '20px', fontSize: '1.1em', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                    Thêm vào giỏ - {formatCurrency(finalPricePerUnit * quantity)}
                </button>
            </div>
        </>
    );
};
// --- KẾT THÚC COMPONENT MODAL ---



export const Menu = () => {
    const [loading, setLoading] = useState(true);
    const [isVegetarian, setIsVegetarian] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);
    const { menuItems } = useMenu();
    const { addToCart } = useCart();
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (menuItems.length > 0) {
            setLoading(false);
        }
    }, [menuItems]);

    // --- HÀM MỚI (ĐÃ SỬA): Xử lý khi bấm nút "Thêm" ---
    const handleOpenOptions = (item) => {
        // Nếu món ăn không có tùy chọn (hoặc tùy chọn rỗng)
        if (!item.optionGroups || item.optionGroups.length === 0) {
            // Thêm thẳng vào giỏ với giá gốc
            addToCart({
                ...item,
                finalPrice: item.price, // Giá cuối = giá gốc
                selectedOptionsText: '', // Không có tùy chọn
                quantity: 1,
                note: ''
            });
        } else {
            // Nếu có tùy chọn, mở Modal
            setSelectedItem(item);
        }
    };
    // --- KẾT THÚC HÀM MỚI ---

    return (
        <div>
            <h3>Thực đơn</h3>
            {/* (Bộ lọc giữ nguyên) */}
            <div>
                <label>
                    <input type="checkbox" checked={isVegetarian} onChange={() => setIsVegetarian(!isVegetarian)} />
                    Món chay
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <input type="checkbox" checked={isSpicy} onChange={() => setIsSpicy(!isSpicy)} />
                    Món cay
                </label>
            </div>

            {/* Danh sách món ăn */}
            {loading ? <p>Đang tải...</p> : (
                <ul style={{listStyle: 'none', paddingLeft: 0}}>
                    {menuItems.map(item => {
                        if (isVegetarian && !item.isVegetarian) return null;
                        if (isSpicy && !item.isSpicy) return null;
                        const isOutOfStock = item.status === 'TEMP_OUT_OF_STOCK';

                        return (
                            <li key={item.id} style={{ opacity: isOutOfStock ? 0.6 : 1, margin: '15px 0' }}>
                                <strong>{item.name}</strong> - {formatCurrency(item.price)}
                                <p>{item.description}</p>

                                <button
                                    onClick={() => handleOpenOptions(item)} // <-- SỬA HÀM GỌI
                                    disabled={isOutOfStock}
                                >
                                    {isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* --- HIỂN THỊ MODAL --- */}
            {selectedItem && (
                <OptionModal
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                    onAddToCart={addToCart}
                />
            )}
        </div>
    );
};