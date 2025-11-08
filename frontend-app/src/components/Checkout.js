// src/components/Checkout.js
import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// --- 1. LẤY API URL TỪ BIẾN MÔI TRƯỜNG ---
const API_URL = process.env.REACT_APP_API_URL; // Sẽ là http://localhost:8080

export const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { currentUser } = useAuth();

    // (handleCheckout đã được cập nhật)
    const handleCheckout = async () => {
        if (cartItems.length === 0) {
            alert("Vui lòng thêm món vào giỏ hàng!");
            return;
        }
        if (!currentUser) {
            alert("Vui lòng đăng nhập để thanh toán.");
            navigate('/login');
            return;
        }

        setIsLoading(true);

        try {
            // --- 2. SỬA LẠI LỆNH GỌI API (THÊM URL ĐẦY ĐỦ) ---
            console.log("Đang giả lập thanh toán...");
            const paymentResponse = await axios.post(`${API_URL}/api/payments/mock`);

            if (paymentResponse.data.status === "SUCCESS") {
                console.log("Thanh toán thành công:", paymentResponse.data.transaction_id);

                const orderRequest = {
                    items: cartItems.map(item => ({
                        menuItemId: item.id,
                        quantity: item.quantity
                    })),
                    pickupWindow: new Date(Date.now() + 15 * 60000).toISOString()
                };

                console.log("Đang gửi đơn hàng:", orderRequest);
                // --- 3. SỬA LẠI LỆNH GỌI API (THÊM URL ĐẦY ĐỦ) ---
                await axios.post(`${API_URL}/api/orders`, orderRequest);
                console.log("Đơn hàng đã được tiếp nhận và đang đưa vào hàng đợi.");

                if (clearCart) {
                    clearCart();
                }

                alert("Đơn hàng của bạn đã được tiếp nhận và đang được xử lý!");
                navigate('/my-orders');

            }
        } catch (error) {
            // (Log lỗi này bạn đang thấy)
            console.error("Lỗi khi thanh toán hoặc gửi đơn hàng:", error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
                navigate('/login');
            } else {
                alert("Đã xảy ra lỗi, vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button onClick={handleCheckout} disabled={isLoading || cartItems.length === 0}>
            {isLoading ? "Đang xử lý..." : "Thanh toán"}
        </button>
    );
};