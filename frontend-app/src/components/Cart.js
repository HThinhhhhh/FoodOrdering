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

    const [hasActiveOrder, setHasActiveOrder] = useState(false);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setIsLoadingOrders(false);
            setHasActiveOrder(false);
            return;
        }

        const checkActiveOrders = async () => {
            setIsLoadingOrders(true);
            try {
                const response = await axios.get(`${API_URL}/api/orders/my-orders`);
                const orders = response.data;

                // --- SỬA LOGIC LỌC (Bug 1) ---
                // Đơn hàng đang hoạt động là RECEIVED, PREPARING, hoặc READY
                const active = orders.some(order =>
                    order.status === 'RECEIVED' ||
                    order.status === 'PREPARING' ||
                    order.status === 'READY'
                );
                setHasActiveOrder(active);
                // --- KẾT THÚC SỬA ---

            } catch (error) {
                console.error("Lỗi khi kiểm tra đơn hàng đang hoạt động:", error);
                setHasActiveOrder(false);
            }
            setIsLoadingOrders(false);
        };

        checkActiveOrders();
    }, [currentUser]);

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // (renderCheckoutButton giữ nguyên)
    const renderCheckoutButton = () => {
        const isDisabled = cartItems.length === 0 || !currentUser || hasActiveOrder || isLoadingOrders;

        let title = "Đến trang Thanh toán";
        if (!currentUser) title = "Vui lòng đăng nhập để thanh toán";
        if (cartItems.length === 0) title = "Vui lòng chọn món";
        if (isLoadingOrders) title = "Đang kiểm tra đơn hàng...";
        if (hasActiveOrder) title = "Bạn đang có một đơn hàng đang xử lý!";

        let buttonText = `${formatCurrency(total)} - Thanh toán`;
        if (isLoadingOrders) buttonText = "Đang tải...";
        if (hasActiveOrder) buttonText = "Bạn có đơn hàng đang xử lý";

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
        </div>
    );
};