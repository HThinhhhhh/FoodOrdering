import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider } from './context/AuthContext';
import { MenuProvider } from './context/MenuContext';
import { CartProvider } from './context/CartContext';
import App from './App';

// --- THÊM DÒNG NÀY ĐỂ IMPORT CSS TOÀN CỤC ---
import './index.css';
// --- KẾT THÚC THÊM ---

axios.defaults.withCredentials = true;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
        <AuthProvider>
            <MenuProvider>
                <CartProvider>
                    <App />
                </CartProvider>
            </MenuProvider>
        </AuthProvider>
    </BrowserRouter>
);