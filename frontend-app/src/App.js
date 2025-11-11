import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout'; // (Tệp này sẽ là trang mới)
import { OrderStatus } from './components/OrderStatus';
import { KitchenDisplay } from './components/KitchenDisplay';
import { MyOrders } from './components/MyOrders';
import { DinerRoute } from './components/DinerRoute';
import { KitchenRoute } from './components/KitchenRoute';
import { LoginPage } from './components/LoginPage';
import { KitchenLoginPage } from './components/KitchenLoginPage';
import { CustomerHeader } from './components/CustomerHeader';
import { KitchenHeader } from './components/KitchenHeader';
import { RegisterPage } from './components/RegisterPage'; // <-- 1. IMPORT MỚI

// --- BỐ CỤC KHÁCH HÀNG (Giao diện A) ---
const CustomerLayout = () => (
    <div>
        <CustomerHeader />
        <hr />
        <Outlet />
    </div>
);

// --- BỐ CỤC BẾP (Giao diện B) ---
const KitchenLayout = () => (
    <div>
        <KitchenHeader />
        <hr />
        <Outlet />
    </div>
);

// --- 2. SỬA LẠI DinerPage ---
function DinerPage() {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
            <div style={{ flex: 2 }}>
                <Menu />
            </div>
            <div style={{ flex: 1 }}>
                <Cart />
                {/* <Checkout /> đã bị xóa khỏi đây */}
            </div>
        </div>
    );
}

function App() {
    return (
        <Routes>
            {/* Bố cục Khách hàng (Giao diện A) */}
            <Route path="/*" element={<CustomerLayout />}>
                <Route index element={<DinerPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} /> {/* <-- 3. THÊM ROUTE MỚI */}

                {/* 4. THÊM ROUTE CHO THANH TOÁN */}
                <Route
                    path="checkout"
                    element={<DinerRoute><Checkout /></DinerRoute>}
                />

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
                <Route path="login" element={<KitchenLoginPage />} />
                <Route
                    path=""
                    element={<KitchenRoute><KitchenDisplay /></KitchenRoute>}
                />
            </Route>
        </Routes>
    );
}

export default App;