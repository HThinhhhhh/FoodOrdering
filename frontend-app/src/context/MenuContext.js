// src/context/MenuContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// --- 1. LẤY API URL TỪ BIẾN MÔI TRƯỜNG ---
const API_URL = process.env.REACT_APP_API_URL; // Sẽ là http://localhost:8080

const MenuContext = createContext();

export const useMenu = () => useContext(MenuContext);

export const MenuProvider = ({ children }) => {
    const [menuItems, setMenuItems] = useState([]);
    const [menuMap, setMenuMap] = useState(new Map());

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                // --- 2. SỬA LẠI LỆNH GỌI API (THÊM URL ĐẦY ĐỦ) ---
                const response = await axios.get(`${API_URL}/api/menu`);
                setMenuItems(response.data);

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
    }, []);

    const getItemName = (menuItemId) => {
        return menuMap.get(menuItemId) || `(Món ID: ${menuItemId})`;
    };

    const value = {
        menuItems,
        getItemName
    };

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    );
};