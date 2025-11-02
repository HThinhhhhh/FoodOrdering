// src/context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

// 1. Tạo Context
const CartContext = createContext();

// 2. Tạo Provider (Component "cung cấp" state)
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (menuItem) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === menuItem.id);
            if (existingItem) {
                // Tăng số lượng nếu đã có
                return prevItems.map(item =>
                    item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Thêm mới
            return [...prevItems, { ...menuItem, quantity: 1 }];
        });
        console.log("Đã thêm vào giỏ:", menuItem.name);
    };

    const value = { cartItems, addToCart };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// 3. Tạo Hook tùy chỉnh (để sử dụng context dễ dàng)
export const useCart = () => {
    return useContext(CartContext);
};