// src/components/Cart.js
import React from 'react';
import { useCart } from '../context/CartContext';

export const Cart = () => {
    const { cartItems } = useCart();

    if (cartItems.length === 0) {
        return <p>Giỏ hàng của bạn đang trống.</p>;
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <div>
            <h4>Giỏ hàng</h4>
            <ul>
                {cartItems.map(item => (
                    <li key={item.id}>
                        {item.name} x {item.quantity} - ${item.price * item.quantity}
                    </li>
                ))}
            </ul>
            <strong>Tổng cộng: ${total.toFixed(2)}</strong>
        </div>
    );
};