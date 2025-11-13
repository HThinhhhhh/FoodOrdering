// src/components/Menu.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useMenu } from '../context/MenuContext';
import { BigDecimal } from 'bigdecimal';

const API_URL = process.env.REACT_APP_API_URL;

// --- COMPONENT MODAL (ĐÃ CẬP NHẬT LOGIC SỐ LƯỢNG) ---
const OptionModal = ({ item, onClose, onAddToCart }) => {

    // --- SỬA ĐỔI STATE ---
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const initialSelections = new Map();
        (item.optionGroups || []).forEach(group => {
            if (group.selectionType === 'SINGLE_REQUIRED' && group.options && group.options.length > 0) {
                // Radio: Tự động chọn mục đầu tiên
                initialSelections.set(group.id, group.options[0].id);
            }
            if (group.selectionType === 'MULTI_SELECT') {
                // Multi-select: Khởi tạo là Map { optionId -> quantity }
                initialSelections.set(group.id, new Map());
            }
            // (SINGLE_OPTIONAL mặc định là null)
        });
        return initialSelections;
    });
    // --- KẾT THÚC SỬA ĐỔI ---

    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [validationError, setValidationError] = useState('');

    // --- SỬA ĐỔI: TÍNH TOÁN GIÁ (HỖ TRỢ SỐ LƯỢNG OPTION) ---
    let currentPrice = new BigDecimal(item.price.toString()); // Giá gốc
    let optionsText = []; // Chuỗi text cho Bếp

    (item.optionGroups || []).forEach(group => {
        const selection = selectedOptions.get(group.id);
        if (!selection) return;

        if (group.selectionType === 'MULTI_SELECT') {
            // selection là một Map (Vd: {3 => 2, 4 => 1})
            selection.forEach((quantity, selectedItemId) => {
                const selectedItem = group.options.find(opt => opt.id === selectedItemId);
                if (selectedItem) {
                    // Giá = Giá gốc + (Giá option * số lượng option)
                    const optionPrice = new BigDecimal(selectedItem.price.toString());
                    const optionQuantity = new BigDecimal(quantity.toString());
                    currentPrice = currentPrice.add(optionPrice.multiply(optionQuantity));

                    optionsText.push(`${quantity} x ${selectedItem.name}`);
                }
            });
        } else {
            // selection là một ID (Vd: 2) - Logic Radio giữ nguyên
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


    // --- HÀM MỚI: Xử lý chọn Radio ---
    const handleRadioSelect = (groupId, optionItemId) => {
        setValidationError(''); // Xóa lỗi cũ
        setSelectedOptions(prev => {
            const newSelections = new Map(prev);
            newSelections.set(groupId, optionItemId); // Chỉ gán ID
            return newSelections;
        });
    };

    // --- HÀM MỚI: Xử lý tăng/giảm số lượng cho Multi-select ---
    const handleMultiQuantityChange = (groupId, optionItemId, delta) => {
        setValidationError('');
        setSelectedOptions(prev => {
            const newSelections = new Map(prev);
            const currentMap = newSelections.get(groupId) || new Map();

            const currentQty = currentMap.get(optionItemId) || 0;
            const newQty = Math.max(0, currentQty + delta); // Đảm bảo không âm

            if (newQty > 0) {
                currentMap.set(optionItemId, newQty);
            } else {
                currentMap.delete(optionItemId); // Xóa khỏi map nếu số lượng là 0
            }

            newSelections.set(groupId, new Map(currentMap)); // Cập nhật Map
            return newSelections;
        });
    };
    // --- KẾT THÚC HÀM MỚI ---


    // (Hàm handleConfirmAdd giữ nguyên - logic validation vẫn đúng)
    const handleConfirmAdd = () => {
        setValidationError('');
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

    // --- CSS MỚI CHO STEPPER ---
    const stepperStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    };
    const stepperButton = {
        padding: '2px 8px',
        fontWeight: 'bold',
        cursor: 'pointer'
    };
    // --- KẾT THÚC CSS MỚI ---

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

                        {/* --- SỬA ĐỔI LOGIC RENDER --- */}
                        <div>
                            {group.options.map(option => {
                                const isRadio = group.selectionType === 'SINGLE_REQUIRED' || group.selectionType === 'SINGLE_OPTIONAL';

                                if (isRadio) {
                                    // --- LOGIC RENDER RADIO (Như cũ) ---
                                    const isChecked = selectedOptions.get(group.id) === option.id;
                                    return (
                                        <label key={option.id} style={{display: 'block', margin: '5px 0'}}>
                                            <input
                                                type="radio"
                                                name={`group-${group.id}`}
                                                checked={isChecked}
                                                onChange={() => handleRadioSelect(group.id, option.id)}
                                            />
                                            {option.name}
                                            ( +{formatCurrency(option.price)} )
                                        </label>
                                    );
                                } else {
                                    // --- LOGIC RENDER MULTI_SELECT (MỚI) ---
                                    const currentQty = selectedOptions.get(group.id)?.get(option.id) || 0;
                                    return (
                                        <div key={option.id} style={{...stepperStyle, justifyContent: 'space-between', margin: '5px 0'}}>
                                            <span>
                                                {option.name}
                                                ( +{formatCurrency(option.price)} )
                                            </span>
                                            <div style={stepperStyle}>
                                                <button
                                                    style={stepperButton}
                                                    onClick={() => handleMultiQuantityChange(group.id, option.id, -1)}
                                                >
                                                    -
                                                </button>
                                                <span style={{width: '20px', textAlign: 'center'}}>{currentQty}</span>
                                                <button
                                                    style={stepperButton}
                                                    onClick={() => handleMultiQuantityChange(group.id, option.id, 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
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



//
// Component MENU (không thay đổi)
//
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

    // (Hàm này giữ nguyên, nó chỉ mở modal hoặc add thẳng)
    const handleOpenOptions = (item) => {
        if (!item.optionGroups || item.optionGroups.length === 0) {
            addToCart({
                ...item,
                finalPrice: item.price,
                selectedOptionsText: '',
                quantity: 1,
                note: ''
            });
        } else {
            setSelectedItem(item);
        }
    };

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

            {/* (Danh sách món ăn giữ nguyên) */}
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
                                    onClick={() => handleOpenOptions(item)}
                                    disabled={isOutOfStock}
                                >
                                    {isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* (Hiển thị modal giữ nguyên) */}
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