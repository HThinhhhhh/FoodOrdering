import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// (Tất cả import component cũ)
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
import { RegisterPage } from './components/RegisterPage';
import { OrderReviewPage } from './components/OrderReviewPage'; // <-- 1. IMPORT MỚI

// (CustomerLayout, KitchenLayout, DinerPage giữ nguyên)
const CustomerLayout = () => ( <div> <CustomerHeader /> <hr /> <Outlet /> </div> );
const KitchenLayout = () => ( <div> <KitchenHeader /> <hr /> <Outlet /> </div> );
function DinerPage() {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
            <div style={{ flex: 2 }}>
                <Menu />
            </div>
            <div style={{ flex: 1 }}>
                <Cart />
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
                <Route path="register" element={<RegisterPage />} />
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
                {/* 2. THÊM ROUTE ĐÁNH GIÁ MỚI */}
                <Route
                    path="review/:orderId"
                    element={<DinerRoute><OrderReviewPage /></DinerRoute>}
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