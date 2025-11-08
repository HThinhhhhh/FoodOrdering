// src/components/Cart.js
import React from 'react';
import { useCart } from '../context/CartContext';

// (CSS giữ nguyên)
const buttonStyle = {
    marginLeft: '5px',
    marginRight: '5px',
    padding: '2px 8px',
    cursor: 'pointer',
    fontWeight: 'bold',
};
// --- THÊM CSS CHO GHI CHÚ ---
const noteInputStyle = {
    width: '90%',
    marginTop: '5px',
    fontSize: '0.9em',
    padding: '3px',
    border: '1px solid #ccc',
    borderRadius: '3px'
};

export const Cart = () => {
    // --- LẤY HÀM MỚI ---
    const { cartItems, addToCart, removeFromCart, updateItemNote } = useCart();

    if (cartItems.length === 0) {
        return <p>Giỏ hàng của bạn đang trống.</p>;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div>
            <h4>Giỏ hàng</h4>
            <ul>
                {cartItems.map(item => (
                    <li key={item.id} style={{ marginBottom: '10px' }}>
                        {item.name}
                        {/* (Phần nút +/- và số lượng giữ nguyên) */}
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

                        {/* --- THÊM Ô NHẬP GHI CHÚ --- */}
                        <input
                            type="text"
                            placeholder="Ghi chú (ví dụ: không cay...)"
                            value={item.note}
                            onChange={(e) => updateItemNote(item.id, e.target.value)}
                            style={noteInputStyle}
                        />
                        {/* --- KẾT THÚC THÊM GHI CHÚ --- */}
                    </li>
                ))}
            </ul>
            <strong>Tổng cộng: ${total.toFixed(2)}</strong>
        </div>
    );
};