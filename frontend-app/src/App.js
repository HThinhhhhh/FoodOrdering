import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

// --- THÊM IMPORT CSS NÀY ---
import './App.css';
// --- KẾT THÚC THÊM ---

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
import { OrderEditPage } from './components/OrderEditPage';
import { AdminRevenuePage } from './components/AdminRevenuePage';
import { AdminVoucherPage } from './components/AdminVoucherPage';
import { VoucherForm } from './components/VoucherForm';
import { OrderReviewPage } from './components/OrderReviewPage';
import { AdminReviewPage } from './components/AdminReviewPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminSettingsPage } from './components/AdminSettingsPage';
import { CustomerFooter } from './components/CustomerFooter';
import { CoverImageBanner } from './components/CoverImageBanner';

import { SettingsProvider } from './context/SettingsContext';



// (CustomerLayout, KitchenLayout, DinerPage giữ nguyên)
const CustomerLayout = () => (
    // Bọc layout khách hàng trong SettingsProvider
    <SettingsProvider>
        <div>
            <CustomerHeader />
            <hr className="app-divider" />
            <Outlet />
            {/* Thêm Footer */}
            <CustomerFooter />
        </div>
    </SettingsProvider>
);

const KitchenLayout = () => (
    <div>
        <KitchenHeader />
        {/* Sửa <hr /> thành className */}
        <hr className="app-divider" />
        <Outlet />
    </div>
);

function DinerPage() {
    return (
        <>
            <CoverImageBanner />
            <div className="diner-layout">
                <div className="diner-menu-column">
                    <Menu />
                </div>
                <div className="diner-cart-column">
                    <Cart />
                </div>
            </div>
        </>
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
                <Route
                    path="review/:orderId"
                    element={<DinerRoute><OrderReviewPage /></DinerRoute>}
                />
            </Route>

            {/* Bố cục Bếp (Giao diện B) */}
            <Route path="/restaurant/*" element={<KitchenLayout />}>
                <Route path="login" element={<KitchenLoginPage />} />

                <Route
                    path=""
                    element={<KitchenRoute><KitchenDisplay /></KitchenRoute>}
                />

                {/* (Tất cả các route admin giữ nguyên) */}
                <Route
                    path="admin/dashboard"
                    element={<AdminRoute><AdminDashboard /></AdminRoute>}
                />
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
                <Route
                    path="admin/orders"
                    element={<AdminRoute><AdminOrderPage /></AdminRoute>}
                />
                <Route
                    path="admin/order/edit/:id"
                    element={<AdminRoute><OrderEditPage /></AdminRoute>}
                />
                <Route
                    path="admin/revenue"
                    element={<AdminRoute><AdminRevenuePage /></AdminRoute>}
                />
                <Route
                    path="admin/vouchers"
                    element={<AdminRoute><AdminVoucherPage /></AdminRoute>}
                />
                <Route
                    path="admin/voucher/new"
                    element={<AdminRoute><VoucherForm /></AdminRoute>}
                />
                <Route
                    path="admin/voucher/edit/:id"
                    element={<AdminRoute><VoucherForm /></AdminRoute>}
                />
                <Route
                    path="admin/reviews"
                    element={<AdminRoute><AdminReviewPage /></AdminRoute>}
                />
                <Route
                    path="admin/settings"
                    element={<AdminRoute><AdminSettingsPage /></AdminRoute>}
                />
            </Route>
        </Routes>
    );
}

export default App;