// src/components/Menu.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency'; // <-- 1. IMPORT HÀM MỚI

const API_URL = process.env.REACT_APP_API_URL;

export const Menu = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isVegetarian, setIsVegetarian] = useState(false);
    const [isSpicy, setIsSpicy] = useState(false);
    const { addToCart } = useCart();

    // (useEffect và fetchMenu giữ nguyên)
    useEffect(() => {
        fetchMenu();
    }, [isVegetarian, isSpicy]);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const params = {
                "is_vegetarian": isVegetarian ? true : undefined,
                "is_spicy": isSpicy ? true : undefined,
            };
            // API này (GET /api/menu) đã được MenuService sửa để
            // chỉ trả về các món ON_SALE và TEMP_OUT_OF_STOCK
            const response = await axios.get(`${API_URL}/api/menu`, { params });
            setMenuItems(response.data);
        } catch (error) {
            console.error("Lỗi khi tải thực đơn:", error);
        }
        setLoading(false);
    };

    return (
        <div>
            <h3>Thực đơn</h3>
            {/* (Bộ lọc giữ nguyên) */}
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
                    {menuItems.map(item => {
                        // --- 1. KIỂM TRA TRẠNG THÁI MÓN ĂN ---
                        const isOutOfStock = item.status === 'TEMP_OUT_OF_STOCK';

                        return (
                            <li key={item.id} style={{ opacity: isOutOfStock ? 0.6 : 1 }}>
                                {/* (Hiển thị hình ảnh nếu có) */}
                                {item.imageUrl && (
                                    <img src={item.imageUrl} alt={item.name} style={{width: '100px', height: '100px', objectFit: 'cover'}} />
                                )}

                                <strong>{item.name}</strong> - {formatCurrency(item.price)}
                                <p>{item.description}</p>

                                {/* --- 2. VÔ HIỆU HÓA NÚT BẤM --- */}
                                <button onClick={() => addToCart(item)} disabled={isOutOfStock}>
                                    {isOutOfStock ? "Tạm hết hàng" : "Thêm vào giỏ"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};