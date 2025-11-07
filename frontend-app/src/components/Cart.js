// src/components/Cart.js
import React from 'react';
import { useCart } from '../context/CartContext';

// --- (Thêm một chút CSS để các nút đẹp hơn) ---
const buttonStyle = {
    marginLeft: '5px',
    marginRight: '5px',
    padding: '2px 8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};

export const Cart = () => {
    // --- LẤY THÊM HÀM MỚI TỪ CONTEXT ---
    const { cartItems, addToCart, removeFromCart } = useCart(); // Lấy thêm addToCart và removeFromCart

    if (cartItems.length === 0) {
        return <p>Giỏ hàng của bạn đang trống.</p>;
    }

    // Tính tổng (giữ nguyên)
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div>
            <h4>Giỏ hàng</h4>
            <ul>
                {cartItems.map(item => (
                    <li key={item.id} style={{ marginBottom: '10px' }}>
                        {item.name}
                        <br />
                        {/* --- BẮT ĐẦU SỬA ĐỔI GIAO DIỆN --- */}
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
                                ${item.price * item.quantity}
                            </span>
                        </div>
                        {/* --- KẾT THÚC SỬA ĐỔI GIAO DIỆN --- */}
                    </li>
                ))}
            </ul>
            <strong>Tổng cộng: ${total.toFixed(2)}</strong>
        </div>
    );
};