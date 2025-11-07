import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// --- 1. IMPORT TẤT CẢ CÁC PROVIDER CỦA BẠN ---
import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';

// (import './index.css';)
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    // --- 2. BỌC TẤT CẢ CÁC PROVIDER QUANH APP ---
    <BrowserRouter>
        <AuthProvider> {/* Cung cấp 'currentUser' */}
            <MenuProvider> {/* Cung cấp 'getItemName' */}
                <CartProvider> {/* Cung cấp 'cartItems', 'addToCart', v.v. */}
                    <App />
                </CartProvider>
            </MenuProvider>
        </AuthProvider>
    </BrowserRouter>
);