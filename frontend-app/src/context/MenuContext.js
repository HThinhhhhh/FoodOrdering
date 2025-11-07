// src/context/MenuContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [menuMap, setMenuMap] = useState(new Map());

    useEffect(() => {
        // Tải thực đơn một lần khi ứng dụng khởi động
        const fetchMenu = async () => {
            try {
                // API này đã trả về DTO an toàn (chúng ta đã sửa ở các bước trước)
                const response = await axios.get("/api/menu");
                setMenuItems(response.data);

                // Tạo một Map để tra cứu nhanh (ID -> Tên món)
                const newMap = new Map();
                for (const item of response.data) {
                    newMap.set(item.id, item.name);
                }
                setMenuMap(newMap);

                console.log("MenuContext đã tải xong thực đơn.");
            } catch (error) {
                console.error("Lỗi khi tải thực đơn cho Context:", error);
            }
        };

        fetchMenu();
    }, []); // Mảng rỗng đảm bảo chỉ chạy 1 lần

    // Hàm để tra cứu tên món ăn từ ID
    const getItemName = (menuItemId) => {
        return menuMap.get(menuItemId) || `(Món ID: ${menuItemId})`;
    };

    const value = {
        menuItems, // Danh sách đầy đủ
        getItemName // Hàm tra cứu
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
};