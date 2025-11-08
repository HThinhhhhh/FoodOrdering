// src/context/CartContext.js
import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(i => i.id === item.id);
            if (itemExists) {
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            // Thêm item mới với note rỗng
            return [...prevItems, { ...item, quantity: 1, note: "" }];
        });
        console.log("Đã thêm vào giỏ:", item.name);
    };

    const removeFromCart = (item) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(i => i.id === item.id);
            if (itemExists && itemExists.quantity === 1) {
                return prevItems.filter(i => i.id !== item.id);
            }
            return prevItems.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
        console.log("Đã bớt/xóa khỏi giỏ:", item.name);
    };

    // --- BẮT ĐẦU: THÊM HÀM MỚI ---
    const updateItemNote = (itemId, note) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, note: note } : item
            )
        );
    };
    // --- KẾT THÚC: THÊM HÀM MỚI ---

    const clearCart = () => {
        setCartItems([]);
        console.log("Đã xóa giỏ hàng.");
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateItemNote // <-- Thêm hàm mới
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};