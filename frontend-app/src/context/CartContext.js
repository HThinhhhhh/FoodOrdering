import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (item) => {
        // ... (logic addToCart của bạn) ...
        // Ví dụ:
        setCartItems(prevItems => {
            const itemExists = prevItems.find(i => i.id === item.id);
            if (itemExists) {
                return prevItems.map(i =>
                    i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
        console.log("Đã thêm vào giỏ:", item.name); // Log này có trong F12 của bạn
    };

    // --- BẮT ĐẦU: THÊM HÀM NÀY ---
    // Hàm này sẽ reset giỏ hàng về mảng rỗng
    const clearCart = () => {
        setCartItems([]);
        console.log("Đã xóa giỏ hàng.");
    };
    // --- KẾT THÚC: THÊM HÀM NÀY ---


    // --- SỬA DÒNG NÀY ---
    // Đảm bảo bạn thêm 'clearCart' vào đối tượng 'value'
    const value = {
        cartItems,
        addToCart,
        clearCart // <-- Thêm vào đây
        // ... (bất kỳ hàm nào khác bạn có, như removeFromCart, v.v.)
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};