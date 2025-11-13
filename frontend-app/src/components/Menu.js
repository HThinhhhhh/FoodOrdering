// src/components/Menu.js
import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useMenu } from '../context/MenuContext';
import { BigDecimal } from 'bigdecimal';

import styles from './Menu.module.css';

// --- COMPONENT MODAL (Không thay đổi, giữ nguyên 100%) ---
const OptionModal = ({ item, onClose, onAddToCart }) => {
    // (Toàn bộ state và logic của Modal giữ nguyên)
    const [selectedOptions, setSelectedOptions] = useState(() => {
        const initialSelections = new Map();
        (item.optionGroups || []).forEach(group => {
            if (group.selectionType === 'SINGLE_REQUIRED' && group.options && group.options.length > 0) {
                initialSelections.set(group.id, group.options[0].id);
            }
            if (group.selectionType === 'MULTI_SELECT') {
                initialSelections.set(group.id, new Map());
            }
        });
        return initialSelections;
    });
    const [note, setNote] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [validationError, setValidationError] = useState('');

    let currentPrice = new BigDecimal(item.price.toString());
    let optionsText = [];
    (item.optionGroups || []).forEach(group => {
        const selection = selectedOptions.get(group.id);
        if (!selection) return;
        if (group.selectionType === 'MULTI_SELECT') {
            selection.forEach((quantity, selectedItemId) => {
                const selectedItem = group.options.find(opt => opt.id === selectedItemId);
                if (selectedItem) {
                    const optionPrice = new BigDecimal(selectedItem.price.toString());
                    const optionQuantity = new BigDecimal(quantity.toString());
                    currentPrice = currentPrice.add(optionPrice.multiply(optionQuantity));
                    optionsText.push(`${quantity} x ${selectedItem.name}`);
                }
            });
        } else {
            const selectedItem = group.options.find(opt => opt.id === selection);
            if (selectedItem) {
                currentPrice = currentPrice.add(new BigDecimal(selectedItem.price.toString()));
                optionsText.push(selectedItem.name);
            }
        }
    });
    const finalPricePerUnit = currentPrice.doubleValue();
    const selectedOptionsText = optionsText.join(', ');
    const handleRadioSelect = (groupId, optionItemId) => {
        setValidationError('');
        setSelectedOptions(prev => {
            const newSelections = new Map(prev);
            newSelections.set(groupId, optionItemId);
            return newSelections;
        });
    };
    const handleMultiQuantityChange = (groupId, optionItemId, delta) => {
        setValidationError('');
        setSelectedOptions(prev => {
            const newSelections = new Map(prev);
            const currentMap = newSelections.get(groupId) || new Map();
            const currentQty = currentMap.get(optionItemId) || 0;
            const newQty = Math.max(0, currentQty + delta);
            if (newQty > 0) {
                currentMap.set(optionItemId, newQty);
            } else {
                currentMap.delete(optionItemId);
            }
            newSelections.set(groupId, new Map(currentMap));
            return newSelections;
        });
    };
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

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.modal}>
                {/* (Toàn bộ JSX của Modal giữ nguyên) */}
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                {(item.optionGroups || []).map(group => (
                    <div key={group.id} className={styles.optionGroup}>
                        <strong>{group.name}</strong>
                        <div>
                            {group.options.map(option => {
                                const isRadio = group.selectionType === 'SINGLE_REQUIRED' || group.selectionType === 'SINGLE_OPTIONAL';
                                if (isRadio) {
                                    const isChecked = selectedOptions.get(group.id) === option.id;
                                    return (
                                        <label key={option.id} className={styles.radioLabel}>
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
                                    const currentQty = selectedOptions.get(group.id)?.get(option.id) || 0;
                                    return (
                                        <div key={option.id} className={styles.stepper}>
                                            <span>
                                                {option.name}
                                                ( +{formatCurrency(option.price)} )
                                            </span>
                                            <div className={styles.stepper}>
                                                <button
                                                    className={styles.stepperButton}
                                                    onClick={() => handleMultiQuantityChange(group.id, option.id, -1)}
                                                >
                                                    -
                                                </button>
                                                <span className={styles.stepperQty}>{currentQty}</span>
                                                <button
                                                    className={styles.stepperButton}
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
                    </div>
                ))}
                <div className={styles.optionGroup}>
                    <label><strong>Ghi chú (cho món này):</strong></label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className={styles.noteTextarea}
                    />
                </div>
                <div className={styles.quantityStepper}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
                {validationError && <p className={styles.validationError}>{validationError}</p>}
                <button onClick={handleConfirmAdd} className={styles.confirmButton}>
                    Thêm vào giỏ - {formatCurrency(finalPricePerUnit * quantity)}
                </button>
            </div>
        </>
    );
};
// --- KẾT THÚC COMPONENT MODAL ---


// --- COMPONENT MENU (ĐÃ SỬA LẠI HOÀN TOÀN) ---
export const Menu = () => {
    const [loading, setLoading] = useState(true);
    // --- XÓA STATE CỦA FILTER CŨ ---
    // const [isVegetarian, setIsVegetarian] = useState(false);
    // const [isSpicy, setIsSpicy] = useState(false);

    const { menuItems } = useMenu();
    const { addToCart } = useCart();
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (menuItems.length > 0) {
            setLoading(false);
        }
    }, [menuItems]);

    // --- LOGIC MỚI: NHÓM MÓN ĂN (Yêu cầu 1) ---
    const groupedMenu = useMemo(() => {
        // Thứ tự hiển thị và Tên Tiêu đề
        const categoryConfig = {
            'COMBO': { name: 'Combo Khuyến Mãi', items: [] },
            'MAIN_COURSE': { name: 'Món Chính', items: [] },
            'APPETIZER': { name: 'Món Khai Vị', items: [] },
            'BEVERAGE': { name: 'Thức Uống', items: [] },
            'DESSERT': { name: 'Món Tráng Miệng', items: [] },
            // Nhóm đặc biệt cho Món Chay
            'VEGETARIAN': { name: 'Món Chay', items: [] },
            'OTHER': { name: 'Khác', items: [] },
        };

        // Lọc và nhóm các món ăn
        for (const item of menuItems) {
            // Lọc các món bị ẩn (DISCONTINUED)
            if (item.status === 'DISCONTINUED') continue;

            // Thêm vào nhóm Category chính
            if (categoryConfig[item.category]) {
                categoryConfig[item.category].items.push(item);
            } else {
                categoryConfig['OTHER'].items.push(item);
            }

            // Thêm vào nhóm Món Chay (nếu có)
            if (item.vegetarian) {
                categoryConfig['VEGETARIAN'].items.push(item);
            }
        }

        // Chuyển đổi sang mảng và lọc các nhóm rỗng
        return Object.entries(categoryConfig)
            .map(([key, value]) => ({ key, ...value }))
            .filter(group => group.items.length > 0);

    }, [menuItems]);
    // --- KẾT THÚC LOGIC NHÓM ---

    // (Hàm handleOpenOptions giữ nguyên)
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
        <div className={styles.container}>
            <h3>Thực đơn</h3>

            {/* --- THANH SIDEBAR NGANG (Yêu cầu 3) --- */}
            {loading ? null : (
                <nav className={styles.categoryNav}>
                    {groupedMenu.map(group => (
                        <a
                            key={group.key}
                            href={`#category-${group.key}`}
                            className={styles.categoryLink}
                        >
                            {group.name}
                        </a>
                    ))}
                </nav>
            )}

            {/* --- XÓA BỎ FILTER CŨ --- */}
            {/* (Đã xóa) */}

            {loading ? <p>Đang tải...</p> : (
                // --- DANH SÁCH MÓN ĂN THEO NHÓM (Yêu cầu 1 & 2) ---
                <div className={styles.menuList}>
                    {groupedMenu.map(group => (
                        <section
                            key={group.key}
                            id={`category-${group.key}`}
                            className={styles.categorySection}
                        >
                            <h2 className={styles.categoryTitle}>{group.name}</h2>

                            {/* BỐ CỤC LƯỚI (GRID) */}
                            <ul className={styles.gridContainer}>
                                {group.items.map(item => {
                                    const isOutOfStock = item.status === 'TEMP_OUT_OF_STOCK';

                                    // ĐÂY LÀ MỖI Ô (CARD)
                                    return (
                                        <li key={item.id} className={`${styles.menuItemCard} ${isOutOfStock ? styles.outOfStock : ''}`}>
                                            {/* 1. KHỐI HÌNH ẢNH */}
                                            <div className={styles.cardImageWrapper}>
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className={styles.menuItemImage} />
                                                ) : (
                                                    <div className={styles.placeholderImage}>
                                                        <span>🍔</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 2. KHỐI NỘI DUNG */}
                                            <div className={styles.cardContent}>
                                                <h3>{item.name}</h3>
                                                <p>{item.description}</p>
                                            </div>

                                            {/* 3. KHỐI CHÂN CARD (GIÁ & NÚT) */}
                                            <div className={styles.cardFooter}>
                                                <strong className={styles.price}>{formatCurrency(item.price)}</strong>
                                                <button
                                                    onClick={() => handleOpenOptions(item)}
                                                    disabled={isOutOfStock}
                                                    className={styles.addButton}
                                                >
                                                    {isOutOfStock ? "Tạm hết" : "Thêm"}
                                                </button>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}
                </div>
            )}

            {/* (Modal JSX giữ nguyên) */}
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