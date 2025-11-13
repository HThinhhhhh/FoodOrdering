// src/components/Cart.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const buttonStyle = {
    marginLeft: '5px',
    marginRight: '5px',
    padding: '2px 8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

export const Cart = () => {
    // --- SỬA ĐỔI: Lấy subtotal và các hàm mới từ context ---
    const {
        cartItems,
        subtotal,
        voucherError,
        updateCartItemQuantity, // Hàm mới
        updateCartItemNote,    // Hàm mới
        removeFromCart         // Hàm mới (nhận cartItemId)
    } = useCart();
    // --- KẾT THÚC SỬA ĐỔI ---

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // (Logic kiểm tra activeOrderCount giữ nguyên)
    const [activeOrderCount, setActiveOrderCount] = useState(0);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
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
                style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 0',
                    marginTop: '15px',
                    textAlign: 'center',
                    backgroundColor: isDisabled ? '#ccc' : 'green',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '5px',
                    fontWeight: 'bold',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    pointerEvents: isDisabled ? 'none' : 'auto'
                }}
                title={title}
            >
                {buttonText}
            </Link>
        );
    };

    return (
        <div>
            <h4>Giỏ hàng</h4>
            {cartItems.length === 0 ? (
                <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
                <ul style={{listStyle: 'none', paddingLeft: 0}}>
                    {/* --- SỬA ĐỔI: LẶP QUA GIỎ HÀNG MỚI --- */}
                    {cartItems.map(item => (
                        <li key={item.cartItemId} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <strong>{item.name}</strong>

                            {/* Hiển thị tùy chọn đã chọn */}
                            {item.selectedOptionsText && (
                                <div style={{fontSize: '0.9em', color: 'gray'}}>
                                    ↳ {item.selectedOptionsText}
                                </div>
                            )}

                            {/* Ghi chú cho món ăn (cập nhật bằng cartItemId) */}
                            <input
                                type="text"
                                placeholder="Ghi chú cho món này..."
                                value={item.note}
                                onChange={(e) => updateCartItemNote(item.cartItemId, e.target.value)}
                                style={{width: '95%', fontSize: '0.9em', marginTop: '5px', padding: '3px'}}
                            />

                            {/* Cập nhật số lượng (cập nhật bằng cartItemId) */}
                            <div>
                                <button
                                    style={buttonStyle}
                                    onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity - 1)}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    style={buttonStyle}
                                    onClick={() => updateCartItemQuantity(item.cartItemId, item.quantity + 1)}
                                >
                                    +
                                </button>
                                <span style={{ marginLeft: '15px' }}>
                                    {/* Giá cuối cùng (đã tính options) * số lượng */}
                                    {formatCurrency(item.finalPrice * item.quantity)}
                                </span>
                            </div>
                        </li>
                    ))}
                    {/* --- KẾT THÚC SỬA ĐỔI --- */}
                </ul>
            )}

            <strong>Tổng cộng: {formatCurrency(subtotal)}</strong>

            {voucherError && <small style={{color: 'red', display: 'block'}}>{voucherError}</small>}

            {renderCheckoutButton()}

            {currentUser && !isLoadingOrders && (
                <p style={{textAlign: 'center', fontSize: '0.9em', color: '#555'}}>
                    Đơn hàng đang xử lý: {activeOrderCount} / 3
                </p>
            )}
        </div>
    );
};