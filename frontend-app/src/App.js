import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderStatus } from './components/OrderStatus';
import { KitchenDisplay } from './components/KitchenDisplay';
import { MyOrders } from './components/MyOrders';
import { DinerRoute } from './components/DinerRoute';
import { KitchenRoute } from './components/KitchenRoute';
import { AdminRoute } from './components/AdminRoute';
import { LoginPage } from './components/LoginPage';
import { KitchenLoginPage } from './components/KitchenLoginPage';
import { CustomerHeader } from './components/CustomerHeader';
import { KitchenHeader } from './components/KitchenHeader';
import { RegisterPage } from './components/RegisterPage';
import { ChangePasswordPage } from './components/ChangePasswordPage';
import { AdminMenuPage } from './components/AdminMenuPage';
import { MenuItemForm } from './components/MenuItemForm';
import { AdminOrderPage } from './components/AdminOrderPage';

// --- 1. THÊM IMPORT MỚI CHO TRANG SỬA ĐƠN HÀNG ---
import { OrderEditPage } from './components/OrderEditPage';


// (Các Layout và DinerPage giữ nguyên)
const CustomerLayout = () => (
    <div>
        <CustomerHeader />
        <hr />
        <Outlet />
    </div>
);

const KitchenLayout = () => (
    <div>
        <KitchenHeader />
        <hr />
        <Outlet />
    </div>
);

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
                <Route
                    path="change-password"
                    element={<DinerRoute><ChangePasswordPage /></DinerRoute>}
                />
            </Route>

            {/* Bố cục Bếp (Giao diện B) */}
            <Route path="/kitchen/*" element={<KitchenLayout />}>
                <Route path="login" element={<KitchenLoginPage />} />

                {/* Trang KDS (KITCHEN, ADMIN) */}
                <Route
                    path=""
                    element={<KitchenRoute><KitchenDisplay /></KitchenRoute>}
                />

                {/* Routes Quản lý Menu (ADMIN only) */}
                <Route
                    path="admin/menu"
                    element={<AdminRoute><AdminMenuPage /></AdminRoute>}
                />
                <Route
                    path="admin/menu/new"
                    element={<AdminRoute><MenuItemForm /></AdminRoute>}
                />
                <Route
                    path="admin/menu/edit/:id"
                    element={<AdminRoute><MenuItemForm /></AdminRoute>}
                />

                {/* Routes Quản lý Đơn hàng (ADMIN, EMPLOYEE) */}
                <Route
                    path="admin/orders"
                    element={<AdminRoute><AdminOrderPage /></AdminRoute>}
                />

                {/* --- 2. THÊM ROUTE SỬA ĐƠN HÀNG --- */}
                <Route
                    path="admin/order/edit/:id"
                    element={<AdminRoute><OrderEditPage /></AdminRoute>}
                />
            </Route>
        </Routes>
    );
}

export default App;