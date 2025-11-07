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
                // Nếu đã tồn tại, tăng số lượng
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            // Nếu chưa, thêm mới với số lượng là 1
            return [...prevItems, { ...item, quantity: 1 }];
        });
        console.log("Đã thêm vào giỏ:", item.name);
    };

    // --- BẮT ĐẦU: THÊM HÀM MỚI ---
    /**
     * Giảm số lượng của một món hàng, hoặc xóa nếu còn 1.
     */
    const removeFromCart = (item) => {
        setCartItems(prevItems => {
            const itemExists = prevItems.find(i => i.id === item.id);

            // Nếu món hàng chỉ còn 1, lọc nó ra khỏi mảng (xóa)
            if (itemExists && itemExists.quantity === 1) {
                return prevItems.filter(i => i.id !== item.id);
            }

            // Nếu còn nhiều hơn 1, chỉ giảm số lượng
            return prevItems.map(i =>
                i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i
            );
        });
        console.log("Đã bớt/xóa khỏi giỏ:", item.name);
    };
    // --- KẾT THÚC: THÊM HÀM MỚI ---


    const clearCart = () => {
        setCartItems([]);
        console.log("Đã xóa giỏ hàng.");
    };

    // --- SỬA DÒNG NÀY ---
    // Thêm 'removeFromCart' vào đối tượng 'value'
    const value = {
        cartItems,
        addToCart,
        removeFromCart, // <-- Thêm vào đây
        clearCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};