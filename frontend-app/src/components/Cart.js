// src/components/Cart.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// --- 1. IMPORT CSS MODULE ---
import styles from './Cart.module.css';

const API_URL = process.env.REACT_APP_API_URL;

// --- 2. XÓA BIẾN buttonStyle ---
// (Đã xóa)

export const Cart = () => {
    const {
        cartItems,
        subtotal,
        voucherError,
        updateCartItemQuantity,
        updateCartItemNote,
        removeFromCart
    } = useCart();

    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeOrderCount, setActiveOrderCount] = useState(0);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    // (useEffect kiểm tra đơn hàng active giữ nguyên)
    useEffect(() => {
        if (!currentUser) {
            setIsLoadingOrders(false);
            setActiveOrderCount(0);
            return;
        }
        const checkActiveOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                const orders = response.data;
                const activeOrders = orders.filter(order =>
                    order.status === 'PENDING_CONFIRMATION' ||
                    order.status === 'RECEIVED' ||
                    order.status === 'PREPARING' ||
                    order.status === 'READY' ||
                    order.status === 'DELIVERING'
                );
                setActiveOrderCount(activeOrders.length);
            } catch (error) {
                console.error("Lỗi khi kiểm tra đơn hàng đang hoạt động:", error);
                setActiveOrderCount(0);
            }
            setIsLoadingOrders(false);
        };
        checkActiveOrders();
    }, [currentUser]);

    const renderCheckoutButton = () => {
        const hasReachedLimit = activeOrderCount >= 3;
        const isDisabled = cartItems.length === 0 || !currentUser || hasReachedLimit || isLoadingOrders;

        let title = "Đến trang Thanh toán";
        if (!currentUser) title = "Vui lòng đăng nhập để thanh toán";
        if (cartItems.length === 0) title = "Vui lòng chọn món";
        if (isLoadingOrders) title = "Đang kiểm tra đơn hàng...";
        if (hasReachedLimit) title = "Bạn đã đạt giới hạn 3 đơn hàng đang xử lý!";

        let buttonText = `${formatCurrency(subtotal)} - Thanh toán`;
        if (isLoadingOrders) buttonText = "Đang tải...";
        if (hasReachedLimit) buttonText = `Đã đạt giới hạn (${activeOrderCount}/3 đơn)`;

        return (
            <Link
                to="/checkout"
                onClick={(e) => { if (isDisabled) e.preventDefault(); }}
                // --- 3. SỬ DỤNG className (có điều kiện) ---
                className={isDisabled ? styles.checkoutButtonDisabled : styles.checkoutButton}
                style={{
                    /* Xóa tất cả style inline cũ */
                }}
                title={title}
            >
                {buttonText}
            </Link>
        );
    };

    return (
        // --- 4. SỬ DỤNG className ---
        <div className={styles.cartContainer}>
            <h4>Giỏ hàng</h4>
            {cartItems.length === 0 ? (
                <p className={styles.emptyCart}>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <ul className={styles.cartList}>
                    {cartItems.map(item => (
                        <li key={item.cartItemId} className={styles.cartItem}>
                            <strong className={styles.itemName}>{item.name}</strong>

                            {/* Hiển thị tùy chọn đã chọn */}
                            {item.selectedOptionsText && (
                                <div className={styles.itemOptions}>
                                    ↳ {item.selectedOptionsText}
                                </div>
                            )}

                            {/* Ghi chú cho món ăn */}
                            <input
                                type="text"
                                placeholder="Ghi chú cho món này..."
                                value={item.note}
                                onChange={(e) => updateCartItemNote(item.cartItemId, e.target.value)}
                                className={styles.itemNoteInput}
                            />

                            {/* Cập nhật số lượng */}
                            <div className={styles.quantityControls}>
                                <div>
                                    <button
                                        className={styles.stepperButton}
                                        onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity - 1)}
                                    >
                                        -
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button
                                        className={styles.stepperButton}
                                        onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                                <span className={styles.itemPrice}>
                                    {formatCurrency(item.finalPrice * item.quantity)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <strong className={styles.subtotal}>Tổng cộng: {formatCurrency(subtotal)}</strong>

            {voucherError && <small className={styles.voucherError}>{voucherError}</small>}

            {renderCheckoutButton()}

            {currentUser && !isLoadingOrders && (
                <p className={styles.activeOrders}>
                    Đơn hàng đang xử lý: {activeOrderCount} / 3
                </p>
            )}
        </div>
    );
};