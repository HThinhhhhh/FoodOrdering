import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- BẮT ĐẦU SỬA ĐỔI: THÊM AXIOS ---
import axios from 'axios';
// --- KẾT THÚC SỬA ĐỔI ---

import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';
import App from './App';

// --- BẮT ĐẦU SỬA ĐỔI: CẤU HÌNH AXIOS ---
// Buộc axios luôn gửi kèm cookie (phiên đăng nhập) cho các yêu cầu
axios.defaults.withCredentials = true;
// --- KẾT THÚC SỬA ĐỔI ---

// (import './index.css';)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <AuthProvider>
            <MenuProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </MenuProvider>
        </AuthProvider>
    </BrowserRouter>
);