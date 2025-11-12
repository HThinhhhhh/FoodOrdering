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

    // --- BẮT ĐẦU: THÊM HÀM MỚI ---
    /**
     * Ghi đè giỏ hàng hiện tại bằng các món từ đơn hàng cũ.
     * @param reorderItems - Danh sách item từ API (chỉ có menuItemId, quantity, note)
     * @param allMenuItems - Toàn bộ danh sách menu (từ MenuContext)
     */
    const loadCartFromReorder = (reorderItems, allMenuItems) => {
        // Tạo một Map để tra cứu thông tin món ăn đầy đủ (tên, giá...) một cách nhanh chóng
        const menuMap = new Map(allMenuItems.map(item => [item.id, item]));

        const newCartItems = [];
        for (const reorderItem of reorderItems) {
            // Lấy thông tin món ăn đầy đủ
            const menuItem = menuMap.get(reorderItem.menuItemId);

            // Chỉ thêm vào giỏ hàng nếu món đó vẫn còn tồn tại trong menu
            if (menuItem) {
                newCartItems.push({
                    ...menuItem, // Gồm: id, name, price, description, etc.
                    quantity: reorderItem.quantity,
                    note: reorderItem.note || "" // Đảm bảo note là chuỗi, không phải null
                });
            }
        }

        setCartItems(newCartItems); // Ghi đè giỏ hàng hiện tại
        console.log("Đã tải lại giỏ hàng từ đơn hàng cũ:", newCartItems);
    };
    // --- KẾT THÚC: THÊM HÀM MỚI ---

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateItemNote, // <-- Thêm hàm mới
        loadCartFromReorder
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};