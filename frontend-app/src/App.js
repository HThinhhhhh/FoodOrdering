import React from 'react';
// --- 1. IMPORT <Outlet /> ---
import { Routes, Route, Outlet } from 'react-router-dom';

import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderStatus } from './components/OrderStatus';
import { KitchenDisplay } from './components/KitchenDisplay';
import { MyOrders } from './components/MyOrders';
import { DinerRoute } from './components/DinerRoute';
import { KitchenRoute } from './components/KitchenRoute';
import { LoginPage } from './components/LoginPage';
import { KitchenLoginPage } from './components/KitchenLoginPage';
import { CustomerHeader } from './components/CustomerHeader';
import { KitchenHeader } from './components/KitchenHeader';

// --- 2. SỬA LẠI BỐ CỤC KHÁCH HÀNG ---
// Layout này sẽ render Header và một "lỗ hổng" (Outlet)
const CustomerLayout = () => (
    <div>
        <CustomerHeader />
        <hr />
        <Outlet /> {/* <-- Sử dụng Outlet thay vì <Routes> */}
    </div>
);

// --- 3. SỬA LẠI BỐ CỤC BẾP ---
const KitchenLayout = () => (
    <div>
        <KitchenHeader />
        <hr />
        <Outlet /> {/* <-- Sử dụng Outlet thay vì <Routes> */}
    </div>
);

// (Hàm DinerPage giữ nguyên)
function DinerPage() {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
            <div style={{ flex: 2 }}>
                <Menu />
            </div>
            <div style={{ flex: 1 }}>
                <Cart />
                <Checkout />
            </div>
        </div>
    );
}

// --- 4. CẤU HÌNH LẠI ROUTES CHÍNH ---
function App() {
    return (
        <Routes>
            {/* Bố cục Khách hàng (Giao diện A) */}
            <Route path="/*" element={<CustomerLayout />}>
                {/* Các đường dẫn con của Khách hàng */}
                <Route index element={<DinerPage />} /> {/* 'index' là path="/" */}
                <Route path="login" element={<LoginPage />} />
                <Route
                    path="my-orders"
                    element={<DinerRoute><MyOrders /></DinerRoute>}
                />
                <Route
                    path="order-status/:orderId"
                    element={<DinerRoute><OrderStatus /></DinerRoute>}
                />
            </Route>

            {/* Bố cục Bếp (Giao diện B) */}
            <Route path="/kitchen/*" element={<KitchenLayout />}>
                {/* Các đường dẫn con của Bếp */}
                <Route path="login" element={<KitchenLoginPage />} />
                <Route
                    path=""  // <-- Đường dẫn trống (khớp với "/kitchen")
                    element={<KitchenRoute><KitchenDisplay /></KitchenRoute>}
                />
            </Route>
        </Routes>
    );
}

export default App;