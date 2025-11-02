// src/components/Checkout.js

// --- PHẦN 1: CÁC IMPORT (ĐÃ ĐẦY ĐỦ) ---
import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// --- PHẦN 2: HẰNG SỐ (GIỮ NGUYÊN) ---
const API_URL = 'http://localhost:8080/api';

export const Checkout = () => {
    // --- PHẦN 3: CÁC HOOKS (GIỮ NGUYÊN) ---
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Giả định chúng ta có ID người dùng (ví dụ: 1)
    const MOCK_USER_ID = 1;

    // --- PHẦN 4: HÀM ĐÃ SỬA VỚI "FINALLY" ---
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Vui lòng thêm món vào giỏ hàng!");
            return;
        }

        setIsLoading(true); // <-- Bật loading

        try {
            // 1. Gọi Mock Payment
            console.log("Đang giả lập thanh toán...");
            const paymentResponse = await axios.post("/api/payments/mock");

            if (paymentResponse.data.status === "SUCCESS") {
                console.log("Thanh toán thành công:", paymentResponse.data.transaction_id);

                // 2. Định dạng và gửi đơn hàng
                const orderRequest = {
                    userId: MOCK_USER_ID,
                    items: cartItems.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity
                    })),
                    pickupWindow: new Date(Date.now() + 15 * 60000).toISOString()
                };

                console.log("Đang gửi đơn hàng:", orderRequest);
                await axios.post("/api/orders", orderRequest);
                console.log("Đơn hàng đã được tiếp nhận và đang đưa vào hàng đợi.");

                // 3. Xóa giỏ hàng
                if (clearCart) {
                    clearCart();
                }

                // 4. Thông báo và điều hướng
                alert("Đơn hàng của bạn đã được tiếp nhận và đang được xử lý!");
                navigate('/');

            }
        } catch (error) {
            console.error("Lỗi khi thanh toán hoặc gửi đơn hàng:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại.");
        } finally {
            // 'finally' sẽ luôn chạy, đảm bảo nút được reset
            setIsLoading(false); // <-- Tắt loading
        }
    };

    // --- PHẦN 5: GIAO DIỆN (GIỮ NGUYÊN) ---
    return (
        <button onClick={handleCheckout} disabled={isLoading || cartItems.length === 0}>
            {isLoading ? "Đang xử lý..." : "Thanh toán"}
        </button>
    );
};