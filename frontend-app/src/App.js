import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderStatus } from './components/OrderStatus';
import { KitchenDisplay } from './components/KitchenDisplay';

// --- IMPORT CÁC TỆP MỚI ---
import { MyOrders } from './components/MyOrders'; // (Từ bước trước)
import { DinerRoute } from './components/DinerRoute'; // Bảo vệ Khách
import { KitchenRoute } from './components/KitchenRoute'; // Bảo vệ Bếp
import { LoginPage } from './components/LoginPage';
// --- KẾT THÚC IMPORT ---


function App() {
    // (Bạn có thể thêm logic hiển thị nút Đăng nhập/Đăng xuất ở đây)

    return (
        <div>
            <nav style={{ padding: '10px', background: '#eee' }}>
                <Link to="/" style={{ marginRight: '15px' }}>Thực đơn</Link>
                <Link to="/my-orders" style={{ marginRight: '15px' }}>Đơn hàng của tôi</Link>
                <Link to="/kitchen" style={{ marginRight: '15px' }}>Màn hình Bếp</Link>
                <Link to="/login">Đăng nhập</Link> {/* Thêm link Đăng nhập */}
            </nav>
            <hr />

            <Routes>
                {/* --- TRANG CÔNG KHAI --- */}
                <Route path="/login" element={<LoginPage />} />
                {/* (Bạn cũng nên tạo trang /register) */}
                <Route path="/" element={<DinerPage />} /> {/* Trang chủ (Menu) vẫn public */}


                {/* === LUỒNG KHÁCH HÀNG (ĐƯỢC BẢO VỆ) === */}
                <Route
                    path="/my-orders"
                    element={
                        <DinerRoute>
                            <MyOrders />
                        </DinerRoute>
                    }
                />
                <Route
                    path="/order-status/:orderId"
                    element={
                        <DinerRoute>
                            <OrderStatus />
                        </DinerRoute>
                    }
                />

                {/* === LUỒNG NHÀ BẾP (ĐƯỢC BẢO VỆ) === */}
                <Route
                    path="/kitchen"
                    element={
                        <KitchenRoute>
                            <KitchenDisplay />
                        </KitchenRoute>
                    }
                />
            </Routes>
        </div>
    );
}

// (DinerPage giữ nguyên)
function DinerPage() {
    return (
        <div style={{ display: 'flex', gap: '20px', padding: '10px' }}>
            <div style={{ flex: 2 }}>
                <Menu />
            </div>
            <div style={{ flex: 1 }}>
                <Cart />
                <Checkout /> {/* Checkout nằm trong trang public, nhưng nó sẽ tự kiểm tra login */}
            </div>
        </div>
    );
}

export default App;