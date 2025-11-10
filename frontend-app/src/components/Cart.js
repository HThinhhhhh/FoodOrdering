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
    const { cartItems, addToCart, removeFromCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    // --- 1. THAY ĐỔI STATE ---
    // Từ boolean (hasActiveOrder) sang number (activeOrderCount)
    const [activeOrderCount, setActiveOrderCount] = useState(0);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    // --- KẾT THÚC THAY ĐỔI ---

    useEffect(() => {
        if (!currentUser) {
            setIsLoadingOrders(false);
            setActiveOrderCount(0); // Nếu không đăng nhập, 0 đơn
            return;
        }

        const checkActiveOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                const orders = response.data;

                // --- 2. SỬA LOGIC LỌC (ĐẾM thay vì SOME) ---
                const activeOrders = orders.filter(order =>
                    order.status === 'RECEIVED' ||
                    order.status === 'PREPARING' ||
                    order.status === 'READY'
                );
                setActiveOrderCount(activeOrders.length);
                // --- KẾT THÚC SỬA ---

            } catch (error) {
                console.error("Lỗi khi kiểm tra đơn hàng đang hoạt động:", error);
                setActiveOrderCount(0);
            }
            setIsLoadingOrders(false);
        };

        checkActiveOrders();
    }, [currentUser]);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const renderCheckoutButton = () => {
        // --- 3. CẬP NHẬT LOGIC VÔ HIỆU HÓA ---
        const hasReachedLimit = activeOrderCount >= 3;
        const isDisabled = cartItems.length === 0 || !currentUser || hasReachedLimit || isLoadingOrders;

        let title = "Đến trang Thanh toán";
        if (!currentUser) title = "Vui lòng đăng nhập để thanh toán";
        if (cartItems.length === 0) title = "Vui lòng chọn món";
        if (isLoadingOrders) title = "Đang kiểm tra đơn hàng...";
        if (hasReachedLimit) title = "Bạn đã đạt giới hạn 3 đơn hàng đang xử lý!";

        // --- 4. CẬP NHẬT VĂN BẢN NÚT ---
        let buttonText = `${formatCurrency(total)} - Thanh toán`;
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
                <ul>
                    {/* (Phần map cartItems giữ nguyên) */}
                    {cartItems.map(item => (
                        <li key={item.id} style={{ marginBottom: '10px' }}>
                            {item.name}
                            <div>
                                <button
                                    style={buttonStyle}
                                    onClick={() => removeFromCart(item)}
                                >
                                    -
                                </button>
                                <span>{item.quantity}</span>
                                <button
                                    style={buttonStyle}
                                    onClick={() => addToCart(item)}
                                >
                                    +
                                </button>
                                <span style={{ marginLeft: '15px' }}>
                                    {formatCurrency(item.price * item.quantity)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <strong>Tổng cộng: {formatCurrency(total)}</strong>

            {renderCheckoutButton()}

            {/* Hiển thị số đơn đang hoạt động */}
            {currentUser && !isLoadingOrders && (
                <p style={{textAlign: 'center', fontSize: '0.9em', color: '#555'}}>
                    Đơn hàng đang xử lý: {activeOrderCount} / 3
                </p>
            )}
        </div>
    );
};