// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // <-- THÊM IMPORT

const API_URL = process.env.REACT_APP_API_URL; // <-- THÊM MỚI

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // --- STATE MỚI CHO VOUCHER ---
    const [voucher, setVoucher] = useState(null); // (VD: { code: 'WELCOME50', discountAmount: 50000, description: '...' })
    const [voucherError, setVoucherError] = useState('');
    // --- KẾT THÚC STATE MỚI ---

    // --- TÍNH TOÁN TỔNG PHỤ ---
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // --- KẾT THÚC TÍNH TOÁN ---

    // Hàm gọi API kiểm tra voucher
    const applyVoucher = async (code) => {
        setVoucherError('');
        if (!code) {
            setVoucherError("Vui lòng nhập mã.");
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/api/vouchers/apply`, {
                code: code,
                subtotal: subtotal // Gửi tạm tính hiện tại
            });
            setVoucher(response.data); // Lưu thông tin voucher (code, discountAmount, description)
        } catch (err) {
            setVoucher(null); // Xóa voucher cũ nếu có
            setVoucherError(err.response?.data || "Lỗi khi áp dụng mã.");
        }
    };

    const removeVoucher = () => {
        setVoucher(null);
        setVoucherError('');
    };

    // --- SỬA ĐỔI: Tự động xóa voucher nếu giỏ hàng thay đổi ---
    const addToCart = (item) => {
        setVoucher(null); // Xóa voucher khi thêm bớt
        setVoucherError('Giỏ hàng đã thay đổi, vui lòng áp dụng lại mã.');
        setCartItems(prevItems => {
            // ... (logic thêm vào giỏ giữ nguyên)
            const itemExists = prevItems.find(i => i.id === item.id);
            if (itemExists) {
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1, note: "" }];
        });
    };

    const removeFromCart = (item) => {
        setVoucher(null); // Xóa voucher khi thêm bớt
        setVoucherError('Giỏ hàng đã thay đổi, vui lòng áp dụng lại mã.');
        setCartItems(prevItems => {
            // ... (logic bớt/xóa giữ nguyên)
            const itemExists = prevItems.find(i => i.id === item.id);
            if (itemExists && itemExists.quantity === 1) {
                return prevItems.filter(i => i.id !== item.id);
            }
            return prevItems.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
    };
    // --- KẾT THÚC SỬA ĐỔI ---

    const updateItemNote = (itemId, note) => {
        // (Giữ nguyên)
    };

    const clearCart = () => {
        setCartItems([]);
        setVoucher(null);
        setVoucherError('');
    };

    const loadCartFromReorder = (reorderItems, allMenuItems) => {
        // (Logic hàm này giữ nguyên)
    };

    const value = {
        cartItems,
        subtotal, // <-- Xuất subtotal
        addToCart,
        removeFromCart,
        clearCart,
        updateItemNote,
        loadCartFromReorder,
        // --- THÊM CÁC HÀM VÀ STATE MỚI ---
        voucher,
        voucherError,
        applyVoucher,
        removeVoucher
        // --- KẾT THÚC THÊM MỚI ---
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};