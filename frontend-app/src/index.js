import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- BẮT ĐẦU SỬA ĐỔI 1: THÊM IMPORT MỚI ---
import { CartProvider } from './context/CartContext'; // <-- Thêm import này
// --- KẾT THÚC SỬA ĐỔI 1 ---

// (Đây là import đã sửa từ trước)
// import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // --- BẮT ĐẦU SỬA ĐỔI 2: BỌC <App /> THÊM MỘT LỚP ---
    <BrowserRouter>
        <CartProvider> {/* <-- Thêm thẻ này */}
            {/* (Phần <React.StrictMode> đã sửa từ trước) */}
            <App />
        </CartProvider> {/* <-- Thêm thẻ này */}
    </BrowserRouter>
    // --- KẾT THÚC SỬA ĐỔI 2 ---
);