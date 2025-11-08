import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import { CustomerHeader } from './components/CustomerHeader'; // (Tệp bạn đã tạo)
import { KitchenHeader } from './components/KitchenHeader'; // (Tệp bạn đã tạo)

// --- BỐ CỤC KHÁCH HÀNG (Giao diện A) ---
const CustomerLayout = () => (
    <div>
        <CustomerHeader />
        <hr />
        <Routes>
            <Route path="/" element={<DinerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/my-orders"
                element={<DinerRoute><MyOrders /></DinerRoute>}
            />
            <Route
                path="/order-status/:orderId"
                element={<DinerRoute><OrderStatus /></DinerRoute>}
            />
        </Routes>
    </div>
);

// --- BỐ CỤC BẾP (Giao diện B) ---
const KitchenLayout = () => (
    <div>
        <KitchenHeader />
        <hr />
        <Routes>
            <Route path="/login" element={<KitchenLoginPage />} />
            <Route
                path="/"
                element={<KitchenRoute><KitchenDisplay /></KitchenRoute>}
            />
        </Routes>
    </div>
);

// Component DinerPage (giữ nguyên)
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

// --- App.js SẼ QUYẾT ĐỊNH RENDER GIAO DIỆN NÀO ---
function App() {
    if (process.env.REACT_APP_MODE === 'KITCHEN') {
        // Nếu là Cổng 3001, chỉ render Giao diện Bếp
        return <KitchenLayout />;
    }

    // Mặc định (Cổng 3000), render Giao diện Khách hàng
    return <CustomerLayout />;
}

export default App;