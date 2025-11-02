import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Menu } from './components/Menu';
import { Cart } from './components/Cart';
import { Checkout } from './components/Checkout';
import { OrderStatus } from './components/OrderStatus';
import { KitchenDisplay } from './components/KitchenDisplay'; // <-- (File mới)

function App() {
    return (
        <div>
            <nav style={{ padding: '10px', background: '#eee' }}>
                <Link to="/" style={{ marginRight: '15px' }}>Thực đơn (Khách)</Link>
                <Link to="/kitchen">Màn hình Bếp (KDS)</Link>
            </nav>
            <hr />

            <Routes>
                {/* === LUỒNG KHÁCH HÀNG === */}
                <Route path="/" element={<DinerPage />} />
                <Route path="/order-status/:orderId" element={<OrderStatus />} />

                {/* === LUỒNG NHÀ BẾP === */}
                <Route path="/kitchen" element={<KitchenDisplay />} />
            </Routes>
        </div>
    );
}

/** * Component con để bố cục trang Khách hàng (Diner)
 */
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

export default App;