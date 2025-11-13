// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [voucher, setVoucher] = useState(null);
    const [voucherError, setVoucherError] = useState('');

    // --- TÍNH TOÁN TỔNG PHỤ (SUBTOTAL) MỚI ---
    // Tính tổng dựa trên 'finalPrice' của mỗi item trong giỏ (đã bao gồm options)
    const subtotal = cartItems.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);

    // Xóa voucher nếu giỏ hàng thay đổi
    useEffect(() => {
        setVoucher(null);
        if (cartItems.length > 0) {
            // (Không tự động báo lỗi, chỉ reset)
        } else {
            setVoucherError('');
        }
    }, [cartItems]); // Chạy mỗi khi cartItems thay đổi

    // (Hàm applyVoucher và removeVoucher giữ nguyên từ Giai đoạn 2)
    const applyVoucher = async (code) => {
        setVoucherError('');
        if (!code) {
            setVoucherError("Vui lòng nhập mã.");
            return;
        }
        try {
            const response = await axios.post(`${API_URL}/api/vouchers/apply`, {
                code: code,
                subtotal: subtotal
            });
            setVoucher(response.data);
        } catch (err) {
            setVoucher(null);
            setVoucherError(err.response?.data || "Lỗi khi áp dụng mã.");
        }
    };
    const removeVoucher = () => {
        setVoucher(null);
        setVoucherError('');
    };

    // --- HÀM ADD/REMOVE CART MỚI ---

    /**
     * Thêm một món (đã có tùy chọn) vào giỏ hàng.
     */
    const addToCart = (itemToAdd) => {
        setCartItems(prevItems => {
            // Logic mới: Luôn thêm dòng mới (vì tùy chọn có thể khác nhau)
            // Gán một ID ngẫu nhiên cho giỏ hàng
            return [...prevItems, { ...itemToAdd, cartItemId: crypto.randomUUID() }];
        });
    };

    // Xóa một item CỤ THỂ khỏi giỏ bằng cartItemId
    const removeFromCart = (cartItemIdToRemove) => {
        setCartItems(prevItems => prevItems.filter(i => i.cartItemId !== cartItemIdToRemove));
    };

    const clearCart = () => {
        setCartItems([]);
        setVoucher(null);
        setVoucherError('');
    };

    const loadCartFromReorder = (reorderItems, allMenuItems) => {
        // (Logic này giữ nguyên)
    };

    // --- HÀM MỚI ---
    // Cập nhật số lượng của một item CỤ THỂ trong giỏ
    const updateCartItemQuantity = (cartItemId, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(cartItemId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Cập nhật ghi chú của một item CỤ THỂ trong giỏ
    const updateCartItemNote = (cartItemId, note) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartItemId === cartItemId ? { ...item, note: note } : item
            )
        );
    };
    // --- KẾT THÚC HÀM MỚI ---

    const value = {
        cartItems,
        subtotal,
        addToCart, // (Giờ đây nhận 1 item đã xử lý)
        removeFromCart, // (Giờ đây nhận cartItemId)
        clearCart,
        updateCartItemNote: updateCartItemNote, // Sửa: Trỏ updateItemNote vào hàm mới
        loadCartFromReorder,

        voucher,
        voucherError,
        applyVoucher,
        removeVoucher,

        // Hàm mới cho giỏ hàng
        updateCartItemQuantity
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};