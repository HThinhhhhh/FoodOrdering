// src/components/Checkout.js
import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8080/api';

export const Checkout = () => {
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Giả định chúng ta có ID người dùng (ví dụ: 1)
    const MOCK_USER_ID = 1;

    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Vui lòng thêm món vào giỏ hàng!");
            return;
        }

        setIsLoading(true);

        try {
            // 1. Gọi Mock Payment
            console.log("Đang giả lập thanh toán...");
            const paymentResponse = await axios.post("/api/payments/mock");

            if (paymentResponse.data.status === "SUCCESS") {
                console.log("Thanh toán thành công:", paymentResponse.data.transaction_id);

                // 2. Định dạng và gửi đơn hàng
                const orderRequest = {
                    userId: MOCK_USER_ID,
                    // Định dạng lại giỏ hàng theo DTO (Prompt 4)
                    items: cartItems.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity
                    })),
                    // Giả định nhận hàng sau 15 phút
                    pickupWindow: new Date(Date.now() + 15 * 60000).toISOString()
                };

                console.log("Đang gửi đơn hàng:", orderRequest);

                // *** GIẢ ĐỊNH QUAN TRỌNG: ***
                // Giả định API /orders trả về order (với id)
                // thay vì chỉ trả về 202 Accepted.
                const orderResponse = await axios.post("/api/orders", orderRequest);

                const orderId = orderResponse.data.id; // Lấy ID từ response

                if (orderId) {
                    console.log("Đơn hàng đã được nhận, ID:", orderId);
                    // 3. Điều hướng đến trang trạng thái
                    navigate(`/order-status/${orderId}`);
                } else {
                    throw new Error("Không nhận được Order ID từ server");
                }
            }
        } catch (error) {
            console.error("Lỗi khi thanh toán:", error);
            alert("Đã xảy ra lỗi, vui lòng thử lại.");
        }
        setIsLoading(false);
    };

    return (
        <button onClick={handleCheckout} disabled={isLoading || cartItems.length === 0}>
            {isLoading ? "Đang xử lý..." : "Thanh toán"}
        </button>
    );
};