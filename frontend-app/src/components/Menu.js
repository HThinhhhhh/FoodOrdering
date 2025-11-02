// src/components/Menu.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

// Giả định API_URL của bạn
const API_URL = 'http://localhost:8080/api';

export const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // State cho bộ lọc
    const [isVegetarian, setIsVegetarian] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);

    const { addToCart } = useCart(); // Lấy hàm addToCart từ Context

    useEffect(() => {
        fetchMenu();
    }, [isVegetarian, isSpicy]); // Gọi lại API khi filter thay đổi

    const fetchMenu = async () => {
        setLoading(true);
        try {
            // Xây dựng params dựa trên state
            const params = {
                "is_vegetarian": isVegetarian ? true : undefined,
                "is_spicy": isSpicy ? true : undefined,
            };

            const response = await axios.get("/api/menu", { params });
            setMenuItems(response.data);
        } catch (error) {
            console.error("Lỗi khi tải thực đơn:", error);
        }
        setLoading(false);
    };

    return (
        <div>
            <h3>Thực đơn</h3>
            {/* Bộ lọc */}
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={isVegetarian}
                        onChange={() => setIsVegetarian(!isVegetarian)}
                    />
                    Món chay
                </label>
                <label style={{ marginLeft: '10px' }}>
                    <input
                        type="checkbox"
                        checked={isSpicy}
                        onChange={() => setIsSpicy(!isSpicy)}
                    />
                    Món cay
                </label>
            </div>

            {/* Danh sách món ăn */}
            {loading ? <p>Đang tải...</p> : (
                <ul>
                    {menuItems.map(item => (
                        <li key={item.id}>
                            <strong>{item.name}</strong> - ${item.price}
                            <p>{item.description}</p>
                            <button onClick={() => addToCart(item)}>Thêm vào giỏ</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};